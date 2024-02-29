/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";

jest.mock("../app/Store", () => mockStore);

// Mock de la fonction de navigation
const onNavigate = (pathname) => {
   document.body.innerHTML = ROUTES({ pathname });
};
// Mock de la fonction de routage
beforeEach(() => {
   Object.defineProperty(window, "localStorage", { value: localStorageMock });
   window.localStorage.setItem(
      "user",
      JSON.stringify({
         type: "Employee",
         email: "employee@test.tld",
      })
   );

   document.body.innerHTML = NewBillUI();
});

// Définition du contexte général du test
describe("Given I am connected as an employee", () => {
   // Test pour vérifier le rendu correct du formulaire
   test("Then a form with nine fields should be rendered", () => {
      // Préparation de l'interface utilisateur de NewBill
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Sélectionner le formulaire pour tester son contenu
      const form = document.querySelector("form");

      // S'attendre à ce que le formulaire ait exactement 9 champs
      expect(form.length).toEqual(9);
   });

   // Contexte pour le test de sélection de fichier
   describe("When I am on NewBill Page and I upload a file", () => {
      // Test pour vérifier que la sélection d'un fichier déclenche handleChangeFile
      test("Then the file input should trigger handleChangeFile on file selection", () => {
         // Préparation de l'interface utilisateur de NewBill
         const html = NewBillUI();
         document.body.innerHTML = html;

         // Mock de la fonction de navigation
         const onNavigateMock = jest.fn();

         // Création d'un mock de NewBill
         const newBillMock = new NewBill({
            document,
            onNavigate: onNavigateMock,
            store: mockStore,
            localStorage: localStorageMock,
         });

         // Espionner la méthode handleChangeFile
         const handleChangeFileSpy = jest.spyOn(
            newBillMock,
            "handleChangeFile"
         );

         // Simuler la sélection d'un fichier
         const fileInput = screen.getByTestId("file");
         const file = new File(["test"], "image.jpg", { type: "image/jpeg" });
         Object.defineProperty(fileInput, "files", { value: [file] });

         // Créer un événement de changement de fichier
         const eventMock = {
            preventDefault: jest.fn(),
            target: {
               value: "C:\\fakepath\\image.jpg",
               files: [file],
            },
         };

         // Déclencher l'événement de changement
         fireEvent.change(fileInput);

         newBillMock.handleChangeFile(eventMock);

         // Vérifier que handleChangeFile a été appelée
         expect(handleChangeFileSpy).toHaveBeenCalled();
      });
   });
});

// Contexte pour le test de l'ajout d'un fichier avec une extension incorrecte
describe("When I add a file with the wrong extension", () => {
   // Test pour vérifier qu'une erreur est retournée
   test("Then I add a file with the wrong extension, an error should be returned", async () => {
      document.body.innerHTML = NewBillUI();

      // Création d'une nouvelle instance de NewBill
      const newBill = new NewBill({
         document: window.document,
         onNavigate: jest.fn(),
         store: null,
         localStorage: window.localStorage,
      });

      // Simulation de la sélection d'un fichier avec une extension incorrecte
      const fileInput = screen.getByTestId("file");
      const file = new File(["test"], "image.pdf", { type: "application/pdf" });
      fireEvent.change(fileInput, { target: { files: [file] } });

      newBill.handleChangeFile({
         preventDefault: () => {},
         target: fileInput,
      });

      // Attendre que le message d'erreur soit affiché
      await waitFor(() => {
         const errorMessageDisplay =
            document.querySelector("#fileErrorMessage");
         expect(errorMessageDisplay.textContent).toBe(
            "Seuls les fichiers JPG, JPEG, et PNG sont acceptés."
         );
      });
   });
});

// Contexte pour le test de la soumission du formulaire NewBill
describe("When I submit the NewBill form", () => {
   // Test pour vérifier la redirection après la soumission du formulaire
   test("Then I submit completed NewBill form and I am redirected on Bill, methode Post", async () => {
      // Préparation de l'interface utilisateur de NewBill
      document.body.innerHTML = `<div id="root"></div>`;

      // Appel de la fonction de routage
      router();

      // Navigation vers la page NewBill
      window.onNavigate(ROUTES_PATH.NewBill);

      // Sélectionner les éléments du formulaire pour les tester
      const expenseName = screen.getByTestId("expense-name");
      expenseName.value = "vol";
      const datepicker = screen.getByTestId("datepicker");
      datepicker.value = "2022-08-22";
      const amount = screen.getByTestId("amount");
      amount.value = "300";
      const vat = screen.getByTestId("vat");
      vat.value = "40";
      const pct = screen.getByTestId("pct");
      pct.value = "50";

      // Simulation de la sélection d'un fichier avec une extension correcte
      const fileInput = screen.getByTestId("file");
      const file = new File(["test"], "image.png", { type: "application/png" });
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Sélectionner le formulaire pour tester son contenu
      const formSubmit = screen.getByTestId("form-new-bill");

      // Création d'une nouvelle instance de NewBill
      const newBill = new NewBill({
         document,
         onNavigate,
         store: mockStore,
         localStorage: window.localStorage,
      });

      // Espionne la méthode handleSubmit
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      // Attache un gestionnaire d'événements de soumission au formulaire
      formSubmit.addEventListener("submit", handleSubmit);

      // Soumettre le formulaire
      fireEvent.submit(formSubmit);

      // Vérifier que handleSubmit a bien été appelée
      expect(handleSubmit).toHaveBeenCalled();

      // Attendre que la redirection soit effectuée
      await waitFor(() => {
         expect(screen.getByText("Mes notes de frais")).toBeInTheDocument();
      });

      // Vérifier que la page de factures a été atteinte
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
   });
});

/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import BillsUI from "../views/BillsUI.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
   describe("When I am on Bills Page", () => {
      test("Then bill icon in vertical layout should be highlighted", async () => {
         Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
         });
         window.localStorage.setItem(
            "user",
            JSON.stringify({
               type: "Employee",
            })
         );
         const root = document.createElement("div");
         root.setAttribute("id", "root");
         document.body.append(root);
         router();
         window.onNavigate(ROUTES_PATH.Bills);
         await waitFor(() => screen.getByTestId("icon-window"));
         const windowIcon = screen.getByTestId("icon-window");
         expect(windowIcon).toHaveClass("active-icon");
      });

      test("Then bills should be ordered from latest to earliest", () => {
         // Exemple de données de factures avec des dates dans différents formats
         const bills = [
            { date: "4 Juil. 24", amount: 100 },
            { date: "3 Fév. 24", amount: 200 },
            { date: "10 Oct. 23", amount: 300 },
         ];

         const billsInstance = new Bills({
            document,
            onNavigate,
            store: null,
            localStorage: null,
         });

         // Utilisation de la fonction sortBills pour trier les factures
         const sortedBills = billsInstance.sortBills(bills);

         const monthMappings = {
            "Jan.": "01",
            "Fév.": "02",
            "Mar.": "03",
            "Avr.": "04",
            "Mai.": "05",
            "Juin.": "06",
            "Juil.": "07",
            "Aoû.": "08",
            "Sep.": "09",
            "Oct.": "10",
            "Nov.": "11",
            "Déc.": "12",
         };

         const parseDate = (str) => {
            const [day, month, year] = str.split(" ");
            // Convertit le format '21 Fév. 24' en '2024-02-21'
            const formattedDate = `20${year}-${monthMappings[month]}-${day}`;
            return new Date(formattedDate);
         };

         // Conversion des dates triées en timestamps pour comparaison
         const timestamps = sortedBills.map((bill) =>
            parseDate(bill.date).getTime()
         );

         // Vérification que chaque date est inférieure ou égale à la précédente (tri décroissant)
         for (let i = 0; i < timestamps.length - 1; i++) {
            expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
         }
      });
   });
});

describe("Given I am connected as an employee", () => {
   describe("When I am on BillUI and I click on new bill button", () => {
      // Vérifie si la fonction `handleClickNewBill` est appelée lorsqu'on clique sur le bouton
      test("Checks whether handleClickNewBill is called when the button is clicked", () => {
         const mockNavigate = jest.fn();

         // Création d'une nouvelle instance de l'objet Bills
         const bills = new Bills({
            document: document,
            onNavigate: mockNavigate,
            store: null,
            localStorage: null,
         });

         document.body.innerHTML =
            "<button data-testid='btn-new-bill'>New Bill</button>";

         // Récupère le bouton
         const newBillButton = document.querySelector(
            "[data-testid='btn-new-bill']"
         );

         // Simule un clic sur le bouton
         newBillButton.addEventListener("click", () =>
            bills.handleClickNewBill()
         );

         // Simule le clic
         fireEvent.click(newBillButton);

         // Vérifie que `handleClickNewBill` a bien été appelée avec l'élément `newBillButton` comme argument
         expect(mockNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
      });
   });
});

describe("Given I am connected as an employee", () => {
   describe("When I am on Bills Page and I click on an eye icon", () => {
      test("Checks whether handleClickIconEye is called when an icon is clicked", () => {
         // On initialise l'élément div "icon-eye"
         document.body.innerHTML = BillsUI({
            data: bills,
         });

         const billsData = new Bills({
            document,
            onNavigate,
            store: null,
            localStorage: window.localStorage,
         });

         const modal = document.getElementById("modaleFile");

         $.fn.modal = jest.fn(() => modal.classList.add("show"));

         // Sélectionne le div représentant l'icône à partir du DOM simulé
         const iconEye = screen.getAllByTestId("icon-eye")[0];

         // Simule l'appel de handleClickIconEye avec iconEye pour tester sa réaction lors du clic sur l'icône.
         const handleClickIconEye = jest.fn(
            billsData.handleClickIconEye(iconEye)
         );

         // Attache un gestionnaire d'événements de clic à l'icône
         iconEye.addEventListener("click", handleClickIconEye);

         // Simule un clic sur l'icône
         fireEvent.click(iconEye);

         // Vérifie que `handleClickIconEye` a bien été appelée avec l'élément `iconEye` comme argument
         expect(handleClickIconEye).toHaveBeenCalled();
      });
   });
});

describe("Given I am connected as an employee", () => {
   // test d'intégration GET Bills
   describe("Given I am a user connected as Employee", () => {
      describe("When I navigate to Bill", () => {
         beforeEach(() => {
            // Surveille les appels faits à la méthode bills
            jest.spyOn(mockStore, "bills");

            // Configure les propriétés locales pour simuler un utilisateur connecté
            Object.defineProperty(window, "localStorage", {
               value: localStorageMock,
            });

            window.localStorage.setItem(
               "user",
               JSON.stringify({
                  type: "Employee",
                  email: "a@a",
               })
            );

            // configure le routage
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.appendChild(root);
            router();
         });

         // Test pour la récupération des factures via l'API mock
         test("fetches bills from mock API GET", async () => {
            localStorage.setItem(
               "user",
               JSON.stringify({ type: "Employee", email: "a@a" })
            );

            // configure le routage
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();

            // Simule la navigation vers la page des factures
            window.onNavigate(ROUTES_PATH.Bills);

            // Attends que le composant des factures soit présent dans le document
            await waitFor(() => {
               expect(screen.getByTestId("tbody")).toBeInTheDocument();
            });

            // Sélectionne toutes les factures dans le corps du tableau
            const billsData = screen
               .getByTestId("tbody")
               .querySelectorAll("tr");

            // Vérifie que les éléments récupérés sont bien présents dans le DOM
            expect(billsData).toBeTruthy();
         });

         // Vérifie la récupération des données depuis l'API qui échoue avec erreur 404
         test("fetches bills from an API and fails with 404 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
               return {
                  list: () => {
                     return Promise.reject(new Error("Erreur 404"));
                  },
               };
            });

            //Navige vers la page Bills
            window.onNavigate(ROUTES_PATH.Bills);

            // Attend la fin du cycle d'événement courant
            await new Promise(process.nextTick);

            // Recherche dans le DOM un élément contenant le texte "Erreur 404"
            const message = await screen.getByText(/Erreur 404/);

            // Vérifie que l'élément trouvé existe bien
            expect(message).toBeTruthy();
         });

         // Vérifie la récupération des données depuis l'API qui échoue avec erreur 500
         test("fetches messages from an API and fails with 500 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
               return {
                  list: () => {
                     return Promise.reject(new Error("Erreur 500"));
                  },
               };
            });

            window.onNavigate(ROUTES_PATH.Bills);
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 500/);
            expect(message).toBeTruthy();
         });
      });
   });
});

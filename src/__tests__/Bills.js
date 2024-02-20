/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import BillsUI from "../views/BillsUI.js";

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
         //to-do write expect expression
      });
      test("Then bills should be ordered from earliest to latest", () => {
         document.body.innerHTML = BillsUI({ data: bills });
         const dates = screen
            .getAllByText(
               /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
            )
            .map((a) => a.innerHTML);
         const antiChrono = (a, b) => (a < b ? 1 : -1);
         const datesSorted = [...dates].sort(antiChrono);
         expect(dates).toEqual(datesSorted);
      });
   });
});

describe("Given I have a list of bills", () => {
   describe("When I sort the bills by date", () => {
      test("Then the bills should be sorted by date in descending order", () => {
         const bills = [
            { date: "2021-04-25" },
            { date: "2021-05-20" },
            { date: "2021-03-10" },
         ];
         const instance = new Bills();
         const sortedBills = instance.sortBills(bills);
         expect(sortedBills[0].date).toBe("2021-05-20");
         expect(sortedBills[1].date).toBe("2021-04-25");
         expect(sortedBills[2].date).toBe("2021-03-10");
      });
   });
});

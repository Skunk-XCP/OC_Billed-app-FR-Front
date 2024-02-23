import { formatDate, formatStatus } from "../app/format.js";
import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class {
   constructor({ document, onNavigate, store, localStorage }) {
      this.document = document;
      this.onNavigate = onNavigate;
      this.store = store;
      const buttonNewBill = document.querySelector(
         `button[data-testid="btn-new-bill"]`
      );
      if (buttonNewBill)
         buttonNewBill.addEventListener("click", this.handleClickNewBill);
      const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
      if (iconEye)
         iconEye.forEach((icon) => {
            icon.addEventListener("click", () => this.handleClickIconEye(icon));
         });
      new Logout({ document, localStorage, onNavigate });
   }

   handleClickNewBill = () => {
      this.onNavigate(ROUTES_PATH["NewBill"]);
   };

   handleClickIconEye = (icon) => {
      const billUrl = icon.getAttribute("data-bill-url");
      const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
      $("#modaleFile")
         .find(".modal-body")
         .html(
            `<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`
         );
      $("#modaleFile").modal("show");
   };

   // sortBills = (bills) => {
   //    return bills.sort((a, b) => ((b < a) ? 1 : -1));
   // };

    sortBills = (bills) => {
      const monthMappings = {
        'Jan.': '01', 'Fév.': '02', 'Mar.': '03', 'Avr.': '04', 'Mai': '05', 'Juin': '06',
        'Juil.': '07', 'Aoû.': '08', 'Sep.': '09', 'Oct.': '10', 'Nov.': '11', 'Déc.': '12'
      };
    
      const parseDate = (str) => {
        const [day, month, year] = str.split(' ');
        // Convertit le format '21 Fév. 24' en '2024-02-21'
        const formattedDate = `20${year}-${monthMappings[month]}-${day}`;
        return new Date(formattedDate);
      };
    
      return bills.sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB - dateA; // Trie par date décroissante
      });
    };
    
   
   getBills = () => {
      if (this.store) {
         return this.store
            .bills()
            .list()
            .then((snapshot) => {
               const bills = snapshot.map((doc) => {
                  try {
                     return {
                        ...doc,
                        date: formatDate(doc.date),
                        status: formatStatus(doc.status),
                     };
                  } catch (e) {
                     // if for some reason, corrupted data was introduced, we manage here failing formatDate function
                     // log the error and return unformatted date in that case
                     console.log(e, "for", doc);
                     return {
                        ...doc,
                        date: doc.date,
                        status: formatStatus(doc.status),
                     };
                  }
               });
               // retour des factures triées par date
               return this.sortBills(bills);
            });
      }
   };
}

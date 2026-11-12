// INITIAL MASTER MENU ITEMS WITH TOTAL INITIAL STOCK
const MASTER_MENU_ITEMS = [
    { id: 1, name: "Agahan Burger", price: 150, category: "Burgers", initialStock: 10 },
    { id: 2, name: "Egg Sandwich", price: 150, category: "Burgers", initialStock: 10 },
    { id: 3, name: "Twice Adobo", price: 220, category: "Rice", initialStock: 8 },
    { id: 4, name: "Tapa Special", price: 195, category: "Rice", initialStock: 12 },
    { id: 5, name: "Carbonara", price: 210, category: "Pasta", initialStock: 5 }
];

// STATE MANAGEMENT
let shiftStarted = false;
let currentActiveTable = null;
let currentCart = [];
let tablesData = [
    { id: "CTO1", status: "available", customers: 1, cart: [] },
    { id: "CTO2", status: "occupied", customers: 2, cart: [{ id: 1, name: "Agahan Burger", price: 150, qty: 1, type: "DINE IN", note: "" }] },
    { id: "DO1", status: "available", customers: 1, cart: [] },
    { id: "DO2", status: "available", customers: 1, cart: [] },
    { id: "DO3", status: "available", customers: 1, cart: [] },
    { id: "DO4", status: "available", customers: 1, cart: [] },
    { id: "DO5", status: "available", customers: 1, cart: [] },
    { id: "DO6", status: "available", customers: 1, cart: [] },
    { id: "HCO1", status: "available", customers: 1, cart: [] },
    { id: "PN01", status: "available", customers: 1, cart: [] },
    { id: "PN02", status: "available", customers: 1, cart: [] },
    { id: "PN03", status: "occupied", customers: 1, cart: [{ id: 3, name: "Burger", price: 220, qty: 1, type: "DINE IN", note: "" }] },
    { id: "PSH1", status: "available", customers: 1, cart: [] },
    { id: "PSH2", status: "available", customers: 1, cart: [] },
    { id: "PSH3", status: "available", customers: 1, cart: [] },
    { id: "PSH4", status: "available", customers: 1, cart: [] },
    { id: "PSH5", status: "available", customers: 1, cart: [] },
    { id: "PSH6", status: "available", customers: 1, cart: [] },
    { id: "TO01", status: "available", customers: 1, cart: [] },
    { id: "TO02", status: "available", customers: 1, cart: [] }
];

// PAYMENT & DISCOUNT STATE
let selectedPaymentMethod = "Card";
let activeDiscountType = "None";
let activeDiscountPct = 0;
let activeDiscountDetails = null;

// ELEMENT REFERENCES
const mainPage = document.getElementById("mainPage");
const dashboardContainer = document.getElementById("dashboardContainer");
const posContainer = document.getElementById("posContainer");
const posTablesView = document.getElementById("posTablesView");
const posOrderView = document.getElementById("posOrderView");

// MODALS
const startCashModal = document.getElementById("startCashModal");
const custCountModal = document.getElementById("custCountModal");
const addTableModal = document.getElementById("addTableModal");
const occupiedTableModal = document.getElementById("occupiedTableModal");
const paymentMethodModal = document.getElementById("paymentMethodModal");
const paymentDetailsModal = document.getElementById("paymentDetailsModal");
const discountTypeSelectionModal = document.getElementById("discountTypeSelectionModal");
const discountFormModal = document.getElementById("discountFormModal");

// ROUTING FUNCTIONS
function showMainPage() {
    mainPage.hidden = false;
    dashboardContainer.hidden = true;
    posContainer.hidden = true;
    document.getElementById("mainTopbar").hidden = false;
}

function openDashboard() {
    mainPage.hidden = true;
    dashboardContainer.hidden = false;
    posContainer.hidden = true;
    document.getElementById("mainTopbar").hidden = true;
    window.scrollTo({ top: 0, behavior: "instant" });
}

function openPOS() {
    mainPage.hidden = true;
    dashboardContainer.hidden = true;
    posContainer.hidden = false;
    document.getElementById("mainTopbar").hidden = true;

    if (!shiftStarted) {
        startCashModal.classList.add("show");
    } else {
        showTablesView();
    }
}

document.getElementById("dashboardCard").addEventListener("click", openDashboard);
document.getElementById("posCard").addEventListener("click", openPOS);
document.getElementById("dashboardBackBtn").addEventListener("click", showMainPage);
document.getElementById("brandHome").addEventListener("click", (e) => {
    e.preventDefault();
    showMainPage();
});

document.getElementById("posBackBtn").addEventListener("click", () => {
    if (!posOrderView.hidden) {
        posOrderView.hidden = true;
        posTablesView.hidden = false;
    } else {
        showMainPage();
    }
});

// POS SHIFT & TABLES
document.getElementById("btnConfirmShift").addEventListener("click", () => {
    const cashVal = parseFloat(document.getElementById("openingCashInput").value) || 0;
    document.getElementById("displayOpeningCash").textContent = "₱" + cashVal.toLocaleString();
    shiftStarted = true;
    startCashModal.classList.remove("show");
    showTablesView();
});

function showTablesView() {
    posTablesView.hidden = false;
    posOrderView.hidden = true;
    renderTablesGrid();
}

function renderTablesGrid() {
    const container = document.getElementById("tablesContainer");
    container.innerHTML = "";

    let avail = 0;
    let occ = 0;

    tablesData.forEach(t => {
        if (t.status === 'occupied') occ++;
        else avail++;

        const btn = document.createElement("button");
        btn.className = `table-btn ${t.status === 'occupied' ? 'occupied' : ''}`;
        btn.innerHTML = `
            <span class="table-dot"></span>
            <strong>${t.id}</strong>
            <small><i class="fa-solid fa-users"></i> ${t.customers}</small>
        `;
        btn.addEventListener("click", () => onSelectTable(t));
        container.appendChild(btn);
    });

    document.getElementById("availCountText").textContent = `Available ${avail}`;
    document.getElementById("occCountText").textContent = `Occupied ${occ}`;
}

// ADD NEW TABLE LOGIC
document.getElementById("btnAddTable").addEventListener("click", () => {
    document.getElementById("newTableNameInput").value = `TABLE ${tablesData.length + 1}`;
    addTableModal.classList.add("show");
});

document.getElementById("btnCloseAddTableModal").addEventListener("click", () => {
    addTableModal.classList.remove("show");
});

document.getElementById("btnConfirmAddTable").addEventListener("click", () => {
    const nameVal = document.getElementById("newTableNameInput").value.trim();
    if (!nameVal) return showToast("Maglagay ng pangalan sa bagong table!");

    const exists = tablesData.some(t => t.id.toLowerCase() === nameVal.toLowerCase());
    if (exists) return showToast("May kaparehong pangalan na ang table na ito!");

    tablesData.push({
        id: nameVal,
        status: "available",
        customers: 1,
        cart: []
    });

    addTableModal.classList.remove("show");
    showToast(`Na-add na ang bagong table: ${nameVal}`);
    renderTablesGrid();
});

// SELECT TABLE HANDLER (AVAILABLE VS OCCUPIED)
function onSelectTable(tableObj) {
    currentActiveTable = tableObj;

    if (tableObj.status === "occupied") {
        openOccupiedTableModal(tableObj);
    } else {
        document.getElementById("custModalTableTitle").textContent = tableObj.id;
        document.getElementById("custCountInput").value = tableObj.customers;
        custCountModal.classList.add("show");
    }
}

// OCCUPIED TABLE MODAL FUNCTIONS
function openOccupiedTableModal(tableObj) {
    document.getElementById("occModalTableName").textContent = tableObj.id;
    document.getElementById("occModalGuests").textContent = `${tableObj.customers} guests`;

    const container = document.getElementById("occItemsContainer");
    container.innerHTML = "";
    let subtotal = 0;

    tableObj.cart.forEach(item => {
        subtotal += item.price * item.qty;
        const div = document.createElement("div");
        div.className = "occ-item-line";
        div.innerHTML = `
            <span>${item.name} ×${item.qty}</span>
            <strong>₱${item.price * item.qty}</strong>
        `;
        container.appendChild(div);
    });

    document.getElementById("occSubtotalVal").textContent = `₱${subtotal.toFixed(0)}`;
    occupiedTableModal.classList.add("show");
}

document.getElementById("btnCloseOccModal").addEventListener("click", () => {
    occupiedTableModal.classList.remove("show");
});

document.getElementById("btnOccProcessPayment").addEventListener("click", () => {
    currentCart = JSON.parse(JSON.stringify(currentActiveTable.cart));
    occupiedTableModal.classList.remove("show");
    paymentMethodModal.classList.add("show");
});

document.getElementById("btnOccAddItems").addEventListener("click", () => {
    currentCart = JSON.parse(JSON.stringify(currentActiveTable.cart));
    occupiedTableModal.classList.remove("show");
    openOrderSection();
});

document.getElementById("btnOccClearTable").addEventListener("click", () => {
    currentActiveTable.cart = [];
    currentActiveTable.status = "available";
    occupiedTableModal.classList.remove("show");
    showToast(`Table ${currentActiveTable.id} cleared and set to available.`);
    renderTablesGrid();
});

// CUSTOMER COUNT MODAL
document.getElementById("btnIncCust").addEventListener("click", () => {
    const input = document.getElementById("custCountInput");
    input.value = parseInt(input.value || 0) + 1;
});

document.getElementById("btnDecCust").addEventListener("click", () => {
    const input = document.getElementById("custCountInput");
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
});

document.getElementById("btnCloseCustModal").addEventListener("click", () => {
    custCountModal.classList.remove("show");
});

document.getElementById("btnConfirmCustCount").addEventListener("click", () => {
    if (!currentActiveTable) return;
    const count = parseInt(document.getElementById("custCountInput").value) || 1;
    currentActiveTable.customers = count;
    currentCart = JSON.parse(JSON.stringify(currentActiveTable.cart));
    custCountModal.classList.remove("show");
    openOrderSection();
});

function openOrderSection() {
    posTablesView.hidden = true;
    posOrderView.hidden = false;
    
    document.getElementById("currentSelectedTableTitle").textContent = `${currentActiveTable.id} - Order`;
    document.getElementById("cartCustCount").textContent = currentActiveTable.customers;
    
    const activeSubCat = document.querySelector(".sub-cat-btn.active")?.dataset.cat || "All";
    const currentSearch = document.getElementById("menuSearchInput").value;
    
    renderProducts(activeSubCat, currentSearch);
    renderCart();
}

// DYNAMIC STOCK LOGIC
function getItemRemainingStock(productId) {
    const masterItem = MASTER_MENU_ITEMS.find(i => i.id === productId);
    if (!masterItem) return 0;
    
    let takenInCart = 0;
    currentCart.forEach(item => {
        if (item.id === productId) {
            takenInCart += item.qty;
        }
    });

    return Math.max(0, masterItem.initialStock - takenInCart);
}

function getItemCartQuantity(productId) {
    let count = 0;
    currentCart.forEach(item => {
        if (item.id === productId) {
            count += item.qty;
        }
    });
    return count;
}

// PRODUCTS RENDERING
function renderProducts(catFilter = "All", searchQuery = "") {
    const grid = document.getElementById("productsGrid");
    grid.innerHTML = "";

    let items = MASTER_MENU_ITEMS;
    if (catFilter !== "All") items = items.filter(i => i.category === catFilter);
    if (searchQuery.trim() !== "") {
        items = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (items.length === 0) {
        grid.innerHTML = `
            <div class="empty-menu-state" style="grid-column: 1/-1;">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>No menu items found</p>
                <small>Try selecting another category or search term.</small>
            </div>
        `;
        return;
    }

    items.forEach(prod => {
        const remainingStock = getItemRemainingStock(prod.id);
        const inCartQty = getItemCartQuantity(prod.id);
        const isOut = remainingStock <= 0;

        const card = document.createElement("div");
        card.className = `product-card ${isOut ? 'disabled' : ''}`;
        card.innerHTML = `
            <span class="stock-tag ${isOut ? 'out-of-stock' : ''}">
                ${isOut ? '0 Available' : remainingStock + ' Available'}
            </span>
            ${inCartQty > 0 ? `<div class="cart-qty-badge">${inCartQty}</div>` : ''}
            <div>
                <h4>${prod.name}</h4>
                <div class="price">₱${prod.price}</div>
            </div>
            <button class="btn-add-item" ${isOut ? 'disabled' : ''}>
                <i class="fa-solid ${isOut ? 'fa-ban' : 'fa-plus'}"></i>
            </button>
        `;

        if (!isOut) {
            card.addEventListener("click", () => addToCart(prod));
        }

        grid.appendChild(card);
    });
}

function addToCart(prod) {
    const remainingStock = getItemRemainingStock(prod.id);
    if (remainingStock <= 0) {
        showToast("Item is out of stock!");
        return;
    }

    const existing = currentCart.find(c => c.id === prod.id && c.type === 'DINE IN');
    if (existing) {
        existing.qty++;
    } else {
        currentCart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1, type: "DINE IN", note: "" });
    }
    
    refreshProductsAndCart();
}

function renderCart() {
    const container = document.getElementById("cartCardsContainer");
    container.innerHTML = "";
    let subtotal = 0;

    currentCart.forEach((item, idx) => {
        subtotal += item.price * item.qty;
        const card = document.createElement("div");
        card.className = "cart-item-card";
        card.innerHTML = `
            <div class="cart-item-row1">
                <div class="cart-item-title">
                    <strong>${item.name}</strong>
                    <small>₱${item.price} each</small>
                </div>
                <div class="cart-item-controls">
                    <button class="btn-qty" onclick="changeQty(${idx}, -1)">-</button>
                    <span style="font-size:12px; font-weight:bold;">${item.qty}</span>
                    <button class="btn-qty" onclick="changeQty(${idx}, 1)">+</button>
                    <button class="btn-del-item" onclick="deleteCartItem(${idx})"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
            <div class="cart-item-row2">
                <input type="text" class="cart-item-note" placeholder="Add item note" value="${item.note}" onchange="updateNote(${idx}, this.value)">
                <button class="btn-dine-tag" onclick="toggleType(${idx})">${item.type} &gt;</button>
            </div>
            <div class="item-total-price">₱${item.price * item.qty}</div>
        `;
        container.appendChild(card);
    });

    document.getElementById("cartSubtotalVal").textContent = `₱${subtotal.toFixed(2)}`;
}

function refreshProductsAndCart() {
    renderCart();
    const activeSubCat = document.querySelector(".sub-cat-btn.active")?.dataset.cat || "All";
    const currentSearch = document.getElementById("menuSearchInput").value;
    renderProducts(activeSubCat, currentSearch);
}

function changeQty(idx, delta) {
    const item = currentCart[idx];
    if (delta > 0) {
        const remainingStock = getItemRemainingStock(item.id);
        if (remainingStock <= 0) {
            showToast("No more stock available!");
            return;
        }
    }
    
    item.qty += delta;
    if (item.qty <= 0) {
        currentCart.splice(idx, 1);
    }
    refreshProductsAndCart();
}

function deleteCartItem(idx) {
    currentCart.splice(idx, 1);
    refreshProductsAndCart();
}

function toggleType(idx) {
    currentCart[idx].type = currentCart[idx].type === "DINE IN" ? "TAKE OUT" : "DINE IN";
    renderCart();
}

function updateNote(idx, val) { currentCart[idx].note = val; }

document.getElementById("btnCleanCart").addEventListener("click", () => { 
    currentCart = []; 
    refreshProductsAndCart(); 
});

document.getElementById("btnCancelOrder").addEventListener("click", showTablesView);

// SAVE ORDER TO TABLE WITH AUTOMATIC RECEIPT PRINT & OCCUPIED RED STATE
document.getElementById("btnSaveOrder").addEventListener("click", () => {
    if (!currentActiveTable) return;
    if (currentCart.length === 0) return showToast("Cart is empty!");

    currentActiveTable.cart = JSON.parse(JSON.stringify(currentCart));
    currentActiveTable.status = "occupied";
    
    showToast(`Order saved to ${currentActiveTable.id}. Printing kitchen receipt...`);
    
    setTimeout(() => {
        window.print();
    }, 500);

    showTablesView();
});

// PAYMENT FLOW & DYNAMIC DETAILS MODAL
document.getElementById("btnPayNow").addEventListener("click", () => {
    if (currentCart.length === 0) return showToast("Cart is empty!");
    paymentMethodModal.classList.add("show");
});

document.getElementById("btnClosePayMethodModal").addEventListener("click", () => {
    paymentMethodModal.classList.remove("show");
});

document.querySelectorAll(".payment-option-card").forEach(card => {
    card.addEventListener("click", () => {
        document.querySelectorAll(".payment-option-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        selectedPaymentMethod = card.dataset.method;

        paymentMethodModal.classList.remove("show");
        openPaymentDetailsModal();
    });
});

function openPaymentDetailsModal() {
    updatePaymentDetailsUI();
    paymentDetailsModal.classList.add("show");
}

document.getElementById("btnClosePayDetailsModal").addEventListener("click", () => {
    paymentDetailsModal.classList.remove("show");
});

document.getElementById("btnBackToOrder").addEventListener("click", () => {
    paymentDetailsModal.classList.remove("show");
});

document.getElementById("btnChangePaymentMethod").addEventListener("click", () => {
    paymentDetailsModal.classList.remove("show");
    paymentMethodModal.classList.add("show");
});

function updatePaymentDetailsUI() {
    const titleEl = document.getElementById("activeMethodTitle");
    const subEl = document.getElementById("activeMethodSub");
    const iconEl = document.getElementById("activeMethodIcon");

    const traceBox = document.getElementById("traceInputContainer");
    const cashBox = document.getElementById("cashInputContainer");
    const traceInputEl = document.getElementById("traceNumberInput");
    const hintTextEl = document.getElementById("transHintText");
    const subDetailEl = document.getElementById("transSubDetailText");

    titleEl.textContent = selectedPaymentMethod;

    if (selectedPaymentMethod === "Cash") {
        subEl.textContent = "Cash drawer";
        iconEl.className = "fa-solid fa-money-bill-wave";
        traceBox.style.display = "none";
        cashBox.style.display = "block";
        subDetailEl.textContent = "Enter the cash received from the customer.";
        hintTextEl.textContent = "Cash payment processed through cash drawer.";
    } else if (selectedPaymentMethod === "Card") {
        subEl.textContent = "Terminal payment";
        iconEl.className = "fa-regular fa-credit-card";
        traceBox.style.display = "block";
        cashBox.style.display = "none";
        document.getElementById("lblTraceTitle").textContent = "Trace Number *";
        traceInputEl.placeholder = "Enter terminal trace number";
        subDetailEl.textContent = "Record the reference from the terminal or payment app.";
        hintTextEl.textContent = "Only the transaction reference is recorded. No card or account details are stored.";
    } else {
        subEl.textContent = "GCash or Maya";
        iconEl.className = "fa-solid fa-wallet";
        traceBox.style.display = "block";
        cashBox.style.display = "none";
        document.getElementById("lblTraceTitle").textContent = "Trace Number *";
        traceInputEl.placeholder = "Enter e-wallet reference number";
        subDetailEl.textContent = "Record the reference from the terminal or payment app.";
        hintTextEl.textContent = "Only the transaction reference is recorded. No card or account details are stored.";
    }

    const selectTypeBtn = document.getElementById("btnOpenDiscountTypesModal");
    const defaultDiscView = document.getElementById("defaultDiscountSectionView");
    const appliedDiscBanner = document.getElementById("appliedDiscountSuccessBanner");

    if (activeDiscountType === "PWD" || activeDiscountType === "Senior Citizen") {
        selectTypeBtn.textContent = "Change Type";
        defaultDiscView.style.display = "none";
        appliedDiscBanner.style.display = "flex";

        document.getElementById("appliedDiscTitle").textContent = `${activeDiscountType} Details Added`;
        
        if (activeDiscountDetails) {
            document.getElementById("appliedDiscSubtitle").textContent = `${activeDiscountDetails.name || 'dd'} · ${activeDiscountDetails.card || 'ddd'}`;
        } else {
            document.getElementById("appliedDiscSubtitle").textContent = "dd · ddd";
        }
    } else {
        selectTypeBtn.textContent = "Select Type";
        defaultDiscView.style.display = "block";
        appliedDiscBanner.style.display = "none";
    }

    let subtotal = 0;
    currentCart.forEach(i => subtotal += i.price * i.qty);

    let discountAmount = 0;
    if (activeDiscountPct > 0) {
        discountAmount = (subtotal * activeDiscountPct) / 100;
    }

    let finalTotal = Math.max(0, subtotal - discountAmount);

    document.getElementById("modalSubtotalVal").textContent = `₱${subtotal.toFixed(2)}`;
    
    if (discountAmount > 0) {
        document.getElementById("modalDiscountRow").style.display = "flex";
        document.getElementById("modalDiscountLabel").textContent = `Discount (${activeDiscountType} ${activeDiscountPct}%)`;
        document.getElementById("modalDiscountVal").textContent = `-₱${discountAmount.toFixed(2)}`;
    } else {
        document.getElementById("modalDiscountRow").style.display = "none";
    }

    document.getElementById("modalTotalDueVal").textContent = `₱${finalTotal.toFixed(2)}`;
    document.getElementById("btnCompleteSaleText").textContent = `Complete Sale · ₱${finalTotal.toFixed(2)}`;

    validatePaymentDetails(finalTotal);
}

const traceInputEl = document.getElementById("traceNumberInput");
const cashReceivedEl = document.getElementById("cashReceivedInput");

traceInputEl.addEventListener("input", () => {
    let subtotal = 0;
    currentCart.forEach(i => subtotal += i.price * i.qty);
    let discountAmount = activeDiscountPct > 0 ? (subtotal * activeDiscountPct) / 100 : 0;
    validatePaymentDetails(Math.max(0, subtotal - discountAmount));
});

cashReceivedEl.addEventListener("input", () => {
    let subtotal = 0;
    currentCart.forEach(i => subtotal += i.price * i.qty);
    let discountAmount = activeDiscountPct > 0 ? (subtotal * activeDiscountPct) / 100 : 0;
    validatePaymentDetails(Math.max(0, subtotal - discountAmount));
});

function validatePaymentDetails(totalAmount) {
    const btn = document.getElementById("btnCompleteSale");
    const notice = document.getElementById("noticeBannerText");

    if (selectedPaymentMethod === "Cash") {
        const cashVal = parseFloat(cashReceivedEl.value) || 0;
        if (cashVal >= totalAmount && totalAmount > 0) {
            btn.classList.add("active");
            const change = cashVal - totalAmount;
            notice.textContent = change > 0 ? `Ready to complete sale. Change: ₱${change.toFixed(2)}` : "Exact cash amount entered.";
        } else {
            btn.classList.remove("active");
            notice.textContent = "Enter enough cash to cover the total.";
        }
    } else {
        const traceVal = traceInputEl.value.trim();
        if (traceVal.length > 0) {
            btn.classList.add("active");
            notice.textContent = "Ready to complete transaction.";
        } else {
            btn.classList.remove("active");
            notice.textContent = "Enter the trace number to continue.";
        }
    }
}

document.getElementById("btnCompleteSale").addEventListener("click", () => {
    let subtotal = 0;
    currentCart.forEach(i => subtotal += i.price * i.qty);
    let discountAmount = activeDiscountPct > 0 ? (subtotal * activeDiscountPct) / 100 : 0;
    let finalTotal = Math.max(0, subtotal - discountAmount);

    if (selectedPaymentMethod === "Cash") {
        const cashVal = parseFloat(cashReceivedEl.value) || 0;
        if (cashVal < finalTotal) return showToast("Kulang ang ibinayad na cash!");
    } else {
        if (!traceInputEl.value.trim()) return showToast("Pakilagay ang Trace / Reference Number!");
    }

    showToast("Transaction Completed Successfully!");
    paymentDetailsModal.classList.remove("show");

    currentActiveTable.cart = [];
    currentActiveTable.status = "available";
    activeDiscountPct = 0;
    activeDiscountType = "None";
    activeDiscountDetails = null;
    traceInputEl.value = "";
    cashReceivedEl.value = "";
    showTablesView();
});

document.querySelectorAll(".chip-btn").forEach(chip => {
    chip.addEventListener("click", () => {
        document.querySelectorAll(".chip-btn").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        activeDiscountPct = parseFloat(chip.dataset.pct) || 0;
        activeDiscountType = activeDiscountPct > 0 ? "Custom" : "None";
        activeDiscountDetails = null;
        updatePaymentDetailsUI();
    });
});

document.getElementById("btnOpenDiscountTypesModal").addEventListener("click", () => {
    paymentDetailsModal.classList.remove("show");
    discountTypeSelectionModal.classList.add("show");
});

document.getElementById("btnEditAppliedDiscount").addEventListener("click", () => {
    paymentDetailsModal.classList.remove("show");
    discountFormModal.classList.add("show");
});

document.getElementById("btnCloseDiscountTypeModal").addEventListener("click", () => {
    discountTypeSelectionModal.classList.remove("show");
    paymentDetailsModal.classList.add("show");
});

document.getElementById("btnContinueNoDiscount").addEventListener("click", () => {
    activeDiscountType = "None";
    activeDiscountPct = 0;
    activeDiscountDetails = null;
    discountTypeSelectionModal.classList.remove("show");
    openPaymentDetailsModal();
});

let targetDiscountCategory = "PWD";

document.getElementById("btnSelectPWD").addEventListener("click", () => {
    targetDiscountCategory = "PWD";
    openDiscountFormModal("PWD Details", "20% OFF", "PWD Card Number *");
});

document.getElementById("btnSelectSenior").addEventListener("click", () => {
    targetDiscountCategory = "Senior Citizen";
    openDiscountFormModal("Senior Citizen Details", "20% OFF", "Senior Citizen Card Number *");
});

function openDiscountFormModal(title, badge, cardLabel) {
    document.getElementById("discFormTitle").textContent = title;
    document.getElementById("discFormBadge").textContent = badge;
    document.getElementById("lblCardNum").textContent = cardLabel;

    if (activeDiscountDetails) {
        document.getElementById("discCardNumInput").value = activeDiscountDetails.card || "";
        document.getElementById("discCodeInput").value = activeDiscountDetails.code || "";
        document.getElementById("discFullNameInput").value = activeDiscountDetails.name || "";
        document.getElementById("discAddressInput").value = activeDiscountDetails.address || "";
    } else {
        document.getElementById("discCardNumInput").value = "";
        document.getElementById("discCodeInput").value = "";
        document.getElementById("discFullNameInput").value = "";
        document.getElementById("discAddressInput").value = "";
    }

    discountTypeSelectionModal.classList.remove("show");
    discountFormModal.classList.add("show");
    checkDiscFormValidation();
}

const discInputs = ["discCardNumInput", "discCodeInput", "discFullNameInput"];
discInputs.forEach(id => {
    document.getElementById(id).addEventListener("input", checkDiscFormValidation);
});

function checkDiscFormValidation() {
    const card = document.getElementById("discCardNumInput").value.trim();
    const code = document.getElementById("discCodeInput").value.trim();
    const name = document.getElementById("discFullNameInput").value.trim();
    const btn = document.getElementById("btnSubmitDiscForm");

    if (card && code && name) {
        btn.classList.add("active");
    } else {
        btn.classList.remove("active");
    }
}

document.getElementById("btnCancelDiscForm").addEventListener("click", () => {
    discountFormModal.classList.remove("show");
    discountTypeSelectionModal.classList.add("show");
});

document.getElementById("btnSubmitDiscForm").addEventListener("click", () => {
    const card = document.getElementById("discCardNumInput").value.trim();
    const code = document.getElementById("discCodeInput").value.trim();
    const name = document.getElementById("discFullNameInput").value.trim();

    if (!card || !code || !name) {
        showToast("Kumpletuhin ang mga required fields (*)");
        return;
    }

    activeDiscountType = targetDiscountCategory;
    activeDiscountPct = 20;
    activeDiscountDetails = {
        card,
        code,
        name,
        address: document.getElementById("discAddressInput").value.trim()
    };

    discountFormModal.classList.remove("show");
    showToast(`Na-apply ang ${activeDiscountType} Discount (20%)!`);
    openPaymentDetailsModal();
});

// SEARCH & CATEGORY FILTERS
document.querySelectorAll(".sub-cat-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".sub-cat-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        renderProducts(e.target.dataset.cat, document.getElementById("menuSearchInput").value);
    });
});

document.getElementById("menuSearchInput").addEventListener("input", (e) => {
    const activeSub = document.querySelector(".sub-cat-btn.active")?.dataset.cat || "All";
    renderProducts(activeSub, e.target.value);
});

document.getElementById("btnCleanSearch").addEventListener("click", () => {
    document.getElementById("menuSearchInput").value = "";
    const activeSub = document.querySelector(".sub-cat-btn.active")?.dataset.cat || "All";
    renderProducts(activeSub);
});

// TOAST & PROFILE HANDLERS
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => { toast.classList.remove("show"); }, 2200);
}

document.querySelectorAll(".menu-card[data-page]").forEach(card => {
    card.addEventListener("click", () => showToast(card.dataset.page + " page is not connected yet."));
});

const profileBtn = document.getElementById("profileBtn");
const profileDropdown = document.getElementById("profileDropdown");
profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("show");
});

document.addEventListener("click", (e) => {
    if (!e.target.closest(".profile-wrap")) profileDropdown.classList.remove("show");
});

document.getElementById("notificationBtn").addEventListener("click", () => {
    document.getElementById("notificationModal").classList.add("show");
});

document.getElementById("closeNotification").addEventListener("click", () => {
    document.getElementById("notificationModal").classList.remove("show");
});

// LIVE DATE UPDATER
function updateDates() {
    const now = new Date();
    const dayStr = new Intl.DateTimeFormat("en-PH", { weekday: "long", timeZone: "Asia/Manila" }).format(now) + ",";
    const dateStr = new Intl.DateTimeFormat("en-PH", { month: "long", day: "numeric", year: "numeric", timeZone: "Asia/Manila" }).format(now);
    
    document.querySelectorAll(".liveDayText").forEach(el => el.textContent = dayStr);
    document.querySelectorAll(".liveDateText").forEach(el => el.textContent = dateStr);
}
updateDates();
setInterval(updateDates, 1000);
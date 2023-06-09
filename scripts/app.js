// Función auxiliar para obtener el formato deseado de los nombres de los derechos de propiedad
const getFormattedPropertyRight = (propertyRight) => {
  const propertyRightMap = {
    marca: "Marca",
    patente: "Patente",
    "diseno-industrial": "Diseño Industrial",
    "modelo-utilidad": "Modelo de Utilidad",
  };
  return propertyRightMap[propertyRight] || propertyRight;
};

// Estructura de datos para definir los periodos de vencimiento de los derechos de propiedad
const expirationPeriods = {
  marca: 10,
  patente: 20,
  "diseno-industrial": 15,
  "modelo-utilidad": 10,
};

// Función para calcular la fecha de vencimiento de un derecho de propiedad industrial
const calculateExpiration = (propertyRight, registrationDate) => {
  const registrationDateObj = new Date(registrationDate);
  const expirationYears = expirationPeriods[propertyRight];

  if (expirationYears === undefined) {
    throw new Error(`Derecho de propiedad desconocido: ${propertyRight}`);
  }

  if (isNaN(registrationDateObj)) {
    return `Ingrese una Fecha de Registro válida.`;
  }

  const deadline = new Date(
    registrationDateObj.getFullYear() + expirationYears,
    registrationDateObj.getMonth(),
    registrationDateObj.getDate()
  );

  const today = new Date();
  const expired = today > deadline;

  if (expired) {
    return `El registro de su ${getFormattedPropertyRight(
      propertyRight
    )} está vencido desde el ${deadline.toLocaleDateString()}.`;
  } else {
    return `El registro de su ${getFormattedPropertyRight(
      propertyRight
    )} aún se encuentra vigente. Su fecha de vencimiento es el ${deadline.toLocaleDateString()}.`;
  }
};

// Evento de envío del formulario
const submitButton = document
  .querySelector("#vencimientos-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Evita que el formulario se envíe
    // Captura los valores ingresados en el formulario
    const propertyRight = document.querySelector(
      'input[name="gridRadios"]:checked'
    ).value;
    const registrationDate = document.querySelector("#inputDate").value;
    try {
      // Llama a la función calculateExpiration con los valores capturados
      const result = await calculateExpiration(propertyRight, registrationDate);

      // Muestra el resultado en el DOM
      const resultContainer = document.querySelector("#resultContainer");
      resultContainer.textContent = result;
    } catch (error) {
      console.error("Error al calcular la expiración:", error);
    }
  });

const productListElement = document.querySelector("#productList");
const serviceListElement = document.querySelector("#serviceList");

// Crear un carrito vacío

let cart = [];

// Obtener productos almacenados en el Local Storage

if (localStorage.getItem("cart")) {
  cart = JSON.parse(localStorage.getItem("cart"));
}

// Funciones para agregar un producto o servicio al carrito

function addToCartProduct(product) {
  const existingItem = cart.find((cartItem) => cartItem.id === product.id);

  existingItem
    ? (existingItem.quantity += 1)
    : cart.push({ ...product, quantity: 1 });

  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartUI();

  Swal.fire({
    icon: "success",
    title: "Producto agregado al carrito",
    showConfirmButton: false,
    timer: 1000,
    timerProgressBar: true,
  });
}

function addToCartService(service) {
  const existingItem = cart.find((cartItem) => cartItem.id === service.id);

  existingItem
    ? (existingItem.quantity += 1)
    : cart.push({ ...service, quantity: 1 });

  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartUI();

  Swal.fire({
    icon: "success",
    title: "Servicio agregado al carrito",
    showConfirmButton: false,
    timer: 1000,
    timerProgressBar: true,
  });
}

// Función para generar un elemento de carrito
function generateCartItemElement(item) {
  const cartItem = document.createElement("li");
  cartItem.classList.add("nav-item");
  cartItem.setAttribute("id", `cartItem-${item.id}`);

  const name = document.createElement("h5");
  name.textContent = item.name;
  cartItem.appendChild(name);

  const price = document.createElement("p");
  price.classList.add("price");
  price.textContent = `$${item.price.toFixed(2)}`;
  cartItem.appendChild(price);

  const quantity = document.createElement("p");
  quantity.classList.add("quantity");
  quantity.textContent = `Cantidad: ${item.quantity}`;
  cartItem.appendChild(quantity);

  // Botón de disminuir cantidad
  const decreaseButton = document.createElement("button");
  decreaseButton.classList.add("decrease-quantity", "btn", "btn-dark");
  const decreaseIcon = document.createElement("i");
  decreaseIcon.classList.add("bi", "bi-dash-circle");
  decreaseButton.appendChild(decreaseIcon);
  cartItem.appendChild(decreaseButton);

  // Event listener para disminuir la cantidad
  decreaseButton.addEventListener("click", () => {
    decreaseQuantity(item);
  });

  // Botón de aumentar cantidad
  const increaseButton = document.createElement("button");
  increaseButton.classList.add("increase-quantity", "btn", "btn-dark");
  const increaseIcon = document.createElement("i");
  increaseIcon.classList.add("bi", "bi-plus-circle");
  increaseButton.appendChild(increaseIcon);
  cartItem.appendChild(increaseButton);

  // Event listener para aumentar la cantidad
  increaseButton.addEventListener("click", () => {
    increaseQuantity(item);
  });

  return cartItem;
}

// Función para aumentar la cantidad del elemento en el carrito
function increaseQuantity(item) {
  item.quantity++;
  updateCartItemQuantity(item);
  updateCartStorage();
  updateCartUI();
}

// Función para disminuir la cantidad del elemento en el carrito
function decreaseQuantity(item) {
  if (item.quantity > 1) {
    item.quantity--;
    updateCartItemQuantity(item);
    updateCartStorage();
    updateCartUI();
  } else {
    Swal.fire({
      title: "¿Desea eliminar este producto del carrito?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        removeFromCart(item);
      }
    });
  }
}

// Función para eliminar elemento del carrito

function removeFromCart(item) {
  const existingItem = cart.find((cartItem) => cartItem.id === item.id);

  existingItem
    ? existingItem.quantity > 1
      ? (existingItem.quantity -= 1)
      : cart.splice(cart.indexOf(existingItem), 1)
    : null;

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

// Función para actualizar la cantidad en el elemento del carrito
function updateCartItemQuantity(item) {
  const cartItem = document.getElementById(`cartItem-${item.id}`);
  if (cartItem) {
    const quantityElement = cartItem.querySelector("p.quantity");
    quantityElement.textContent = `Cantidad: ${item.quantity}`;
  }
}

// Función para actualizar el carrito en el almacenamiento local
function updateCartStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Función para actualizar los elementos del carrito en la interfaz
function updateCartUI() {
  const cartTotalElement = document.querySelector("#cartTotal");
  const cartItemsElement = document.querySelector("#cartItems");

  // Limpiar elementos actuales del carrito
  cartItemsElement.innerHTML = "";

  // Generar elementos del carrito
  cart.forEach((item) => {
    const cartItemElement = generateCartItemElement(item);
    cartItemsElement.appendChild(cartItemElement);
  });

  // Calcular y mostrar el total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotalElement.textContent = `$${total.toFixed(2)}`;
}

function handleBuyButtonClick() {
  // Verificar si hay elementos en el carrito
  const cartIsEmpty = cart.length === 0;
  if (cartIsEmpty) {
    Swal.fire(
      "El carrito está vacío. Agrega productos o servicios antes de comprar."
    );
    return;
  }

  function toggleElementsVisibility(visible) {
    const cartTotalDiv = document.querySelector(".cart-total");
    const buyButton = document.querySelector("#buyButton");
    const clearCartButton = document.querySelector("#clearCartButton");

    cartTotalDiv.hidden = !visible;
    buyButton.hidden = !visible;
    clearCartButton.hidden = !visible;
  }

  // Generar el mensaje de compra
  const productList = [];
  const serviceList = [];

  cart.forEach((item) => {
    if (item.hasOwnProperty("description")) {
      const productItem = document.createElement("div");
      productItem.classList.add("product-item");

      const productName = document.createElement("h5");
      productName.classList.add("product-name");
      productName.textContent = item.name;

      const productQuantity = document.createElement("p");
      productQuantity.classList.add("product-quantity");
      productQuantity.textContent = `(Cantidad: ${item.quantity})`;

      productItem.appendChild(productName);
      productItem.appendChild(productQuantity);

      productList.push(productItem);
    } else if (item.hasOwnProperty("price")) {
      const serviceItem = document.createElement("div");
      serviceItem.classList.add("service-item");

      const serviceName = document.createElement("h5");
      serviceName.classList.add("service-name");
      serviceName.textContent = item.name;

      const serviceQuantity = document.createElement("p");
      serviceQuantity.classList.add("service-quantity");
      serviceQuantity.textContent = `(Cantidad: ${item.quantity})`;

      serviceItem.appendChild(serviceName);
      serviceItem.appendChild(serviceQuantity);

      serviceList.push(serviceItem);
    }
  });

  const productMessage =
    productList.length > 0
      ? `¡Gracias por tu compra! Estamos emocionados de entregarte pronto tus productos o servicios. Aquí tienes una lista de las cosas que has adquirido: ${productList
          .map((item) => item.outerHTML)
          .join(" ")}.`
      : "";

  const purchaseMessage = `${productMessage}`;

  // Vaciar el carrito
  cart = [];
  localStorage.removeItem("cart");
  updateCartUI();

  // Mostrar el spinner
  const spinner = document.createElement("div");
  spinner.classList.add("spinner-border");
  spinner.setAttribute("role", "status");

  const spinnerText = document.createElement("span");
  spinnerText.classList.add("sr-only");

  spinner.appendChild(spinnerText);

  // Agregar el spinner al contenedor
  const messageContainer = document.querySelector("#cartItems");
  messageContainer.appendChild(spinner);

  // Ocultar elementos y mostrar el mensaje de compra después de 5 segundos
  toggleElementsVisibility(false);
  setTimeout(() => {
    // Mostrar el mensaje en el DOM
    const messageContainer = document.querySelector("#cartItems");
    if (messageContainer) {
      messageContainer.innerHTML = purchaseMessage;
      toggleElementsVisibility(false);

      const newPurchaseButton = document.createElement("button");
      newPurchaseButton.textContent = "Realizar una nueva compra";
      newPurchaseButton.classList.add("btn", "btn-dark");
      newPurchaseButton.addEventListener("click", () => {
        location.reload();
      });
      messageContainer.appendChild(newPurchaseButton);
    } else {
      console.error("No se pudo encontrar el contenedor 'cartItems'.");
    }
  }, 5000);
}

// Función para vaciar el carrito
function clearCart() {
  cart = [];
  localStorage.removeItem("cart");
  updateCartUI();
}

// Asignar evento click al botón de compra
const buyButton = document.querySelector("#buyButton");
buyButton.addEventListener("click", handleBuyButtonClick);

// Asignar evento click al botón de vaciar carrito
const clearCartButton = document.querySelector("#clearCartButton");
clearCartButton.addEventListener("click", clearCart);

// Actualizar elementos del carrito en la interfaz al cargar la página
updateCartUI();

let products = [];
let services = [];

async function loadData() {
  try {
    const productsResponse = await fetch("./products.json");
    const servicesResponse = await fetch("./services.json");

    products = await productsResponse.json();
    services = await servicesResponse.json();

    generateProductCards();
    generateServiceCards();
  } catch (error) {
    console.error("Error al cargar los datos:", error);
  }
}

loadData();

function generateProductCards() {
  products.forEach((product) => {
    const card = document.createElement("div");
    card.classList.add(
      "product-card",
      "col-sm-12",
      "col-md-3",
      "col-lg-2",
      "card"
    );

    const image = document.createElement("img");
    image.src = product.image;
    image.classList.add("card-img-top");
    card.appendChild(image);

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const name = document.createElement("h5");
    name.classList.add("card-title");
    name.textContent = product.name;
    cardBody.appendChild(name);

    const description = document.createElement("p");
    description.classList.add("card-text");
    description.textContent = product.description;
    cardBody.appendChild(description);

    const price = document.createElement("p");
    price.classList.add("card-text", "price");
    price.textContent = `$${product.price}`;
    cardBody.appendChild(price);

    const cardFooter = document.createElement("div");
    cardFooter.classList.add("card-body");

    const addToCartButton = document.createElement("button");
    addToCartButton.classList.add("add-to-cart", "btn", "btn-dark");
    addToCartButton.textContent = "Agregar al carrito";
    cardFooter.appendChild(addToCartButton);

    cardBody.appendChild(cardFooter);

    card.appendChild(cardBody);

    productListElement.appendChild(card);

    addToCartButton.addEventListener("click", () => {
      addToCartProduct(product);
    });
  });
}

function generateServiceCards() {
  services.forEach((service) => {
    const card = document.createElement("div");
    card.classList.add(
      "service-card",
      "col-sm-12",
      "col-md-6",
      "col-lg-4",
      "card"
    );

    const image = document.createElement("img");
    image.src = service.image;
    image.classList.add("card-img-top");
    card.appendChild(image);

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const name = document.createElement("h5");
    name.classList.add("card-title");
    name.textContent = service.name;
    cardBody.appendChild(name);

    const description = document.createElement("p");
    description.classList.add("card-text");
    description.textContent = service.description;
    cardBody.appendChild(description);

    const price = document.createElement("p");
    price.classList.add("card-text", "price");
    price.textContent = `$${service.price}`;
    cardBody.appendChild(price);

    const cardFooter = document.createElement("div");
    cardFooter.classList.add("card-body");

    const addToCartButton = document.createElement("button");
    addToCartButton.classList.add("add-to-cart", "btn", "btn-dark");
    addToCartButton.textContent = "Agregar al carrito";
    cardFooter.appendChild(addToCartButton);

    cardBody.appendChild(cardFooter);

    card.appendChild(cardBody);

    serviceListElement.appendChild(card);

    addToCartButton.addEventListener("click", () => {
      addToCartService(service);
    });
  });
}

// Función para capturar la información del formulario y almacenarla en el Local Storage
async function capturarInformacion(event) {
  event.preventDefault(); // Evita que el formulario se envíe

  // Obtener los valores de los campos del formulario
  const nombres = document.querySelector("#exampleInputName1")?.value;
  const apellidos = document.querySelector("#exampleInputName2")?.value;
  const correo = document.querySelector("#exampleInputEmail1")?.value;
  const telefono = document.querySelector("#exampleInputPhoneNumber")?.value;
  const mensaje = document.querySelector("#exampleFormControlTextarea1")?.value;

  // Crear un objeto con la información capturada
  const informacion = {
    nombres,
    apellidos,
    correo,
    telefono,
    mensaje,
  };

  // Obtener el array almacenado en el Local Storage
  const storedData = JSON.parse(localStorage.getItem("contactData")) || [];

  // Agregar la nueva información al array
  storedData.push(informacion);

  // Guardar el array en el Local Storage
  await localStorage.setItem("contactData", JSON.stringify(storedData));

  // Mostrar el mensaje de agradecimiento en la sección correspondiente
  const contactContainer = document.querySelector(".contact-container");
  const mensajeHTML = `
      <p>Su solicitud ha sido recibida. Nos comunicaremos con usted pronto para brindarle la información que necesita.</p>
      <button class="btn btn-light" id="revisarConsulta">Revisar consulta</button>
    `;

  contactContainer.innerHTML = mensajeHTML;

  // Vaciar el Local Storage al hacer clic en "Revisar consulta"
  const revisarConsultaBtn = document.getElementById("revisarConsulta");
  revisarConsultaBtn.addEventListener("click", () => {
    localStorage.removeItem("contactData");
    mostrarMensajeAgradecimiento(storedData);
  });
}

// Función para mostrar el mensaje de agradecimiento en la sección correspondiente
function mostrarMensajeAgradecimiento(storedData) {
  const contactContainer = document.querySelector(".contact-container");
  const mensajeHTML = `
      <p>Muchas gracias por ponerse en contacto con nosotros, hemos recibido la siguiente información:</p>
      <ul>
        ${storedData
          .map(
            (item) => `
          <li>Nombres: ${item.nombres}</li>
          <li>Apellidos: ${item.apellidos}</li>
          <li>Correo Electrónico: ${item.correo}</li>
          <li>Número de Teléfono o Celular: ${item.telefono}</li>
          <li>¿En qué podemos ayudarte?: ${item.mensaje}</li>
        `
          )
          .join("")}
      </ul>
      <p>Pronto recibirá noticias nuestras. ¡Estamos emocionados por hablar con usted!</p>
    `;

  contactContainer.innerHTML = mensajeHTML;
}

// Asociar la función capturarInformacion al evento submit del formulario
const formContact = document.querySelector(".contacto form");
formContact.addEventListener("submit", capturarInformacion);

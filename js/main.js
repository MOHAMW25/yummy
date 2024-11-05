const rowData = document.getElementById("rowData");
const searchContainer = document.getElementById("searchContainer");
let submitBtn;

$(document).ready(() => {
    initializeApp();
});

function initializeApp() {
    searchByName("").then(() => {
        $(".loading-screen").fadeOut(500);
        $("body").css("overflow", "visible");
    });
}

async function fetchApi(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch API error:", error);
        return null;  
    }
}

async function searchByName(query) {
    closeSideNav();
    rowData.innerHTML = "";
    $(".inner-loading-screen").fadeIn(300);  

    const data = await fetchApi(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
    if (data) {
        displayMeals(data.meals || []);
    } else {
        console.log("No meals found.");
    }
    $(".inner-loading-screen").fadeOut(300);  
}

async function getCategories() {
    clearContainers();
    $(".inner-loading-screen").fadeIn(300);
    
    const data = await fetchApi(`https://www.themealdb.com/api/json/v1/1/categories.php`);
    if (data) {
        displayCategories(data.categories);
    } else {
        console.log("No categories found.");
    }
    $(".inner-loading-screen").fadeOut(300);
}

async function getArea() {
    clearContainers();
    $(".inner-loading-screen").fadeIn(300);

    const data = await fetchApi(`https://www.themealdb.com/api/json/v1/1/list.php?a=list`);
    if (data) {
        displayArea(data.meals);
    } else {
        console.log("No areas found.");
    }
    $(".inner-loading-screen").fadeOut(300);
}

async function getIngredients() {
    clearContainers();
    $(".inner-loading-screen").fadeIn(300);

    const data = await fetchApi(`https://www.themealdb.com/api/json/v1/1/list.php?i=list`);
    if (data) {
        displayIngredients(data.meals.slice(0, 20));
    } else {
        console.log("No ingredients found.");
    }
    $(".inner-loading-screen").fadeOut(300);
}

function clearContainers() {
    rowData.innerHTML = "";
    searchContainer.innerHTML = "";
}

function displayMeals(arr) {
    const mealsHtml = arr.map(meal => `
        <div class="col-md-3 py-4">
            <div onclick="getMealDetails('${meal.idMeal}')" class="meal position-relative overflow-hidden rounded-2 cursor-pointer">
                <img class="w-100" src="${meal.strMealThumb}" alt="">
                <div class="meal-layer position-absolute d-flex align-items-center text-black p-2">
                    <h3>${meal.strMeal}</h3>
                </div>
            </div>
        </div>
    `).join('');

    rowData.innerHTML = `<div class="row">${mealsHtml}</div>`;
}

function displayCategories(arr) {
    const categoriesHtml = arr.map(category => `
        <div class="col-md-3 py-4">
            <div onclick="getCategoryMeals('${category.strCategory}')" class="meal position-relative overflow-hidden rounded-2 cursor-pointer">
                <img class="w-100" src="${category.strCategoryThumb}" alt="${category.strCategory}">
                <div class="meal-layer position-absolute text-center text-black p-2">
                    <h3>${category.strCategory}</h3>
                    <p>${category.strCategoryDescription.split(" ").slice(0, 20).join(" ")}</p>
                </div>
            </div>
        </div>
    `).join('');

    rowData.innerHTML = `<div class="row">${categoriesHtml}</div>`;
}

function displayArea(arr) {
    const areasHtml = arr.map(area => `
        <div class="col col-md-3">
            <div onclick="getAreaMeals('${area.strArea}')" class="rounded-2 text-center cursor-pointer">
                <i class="fa-solid fa-house-laptop fa-4x"></i>
                <h3>${area.strArea}</h3>
            </div>
        </div>
    `).join('');

    rowData.innerHTML = `<div class="row d-flex flex-row flex-wrap justify-content-between">${areasHtml}</div>`;
}

function displayIngredients(arr) {
    const ingredientsHtml = arr.map(ingredient => `
        <div class="col-md-3">
            <div onclick="getIngredientsMeals('${ingredient.strIngredient}')" class="rounded-2 text-center cursor-pointer">
                <i class="fa-solid fa-drumstick-bite fa-4x"></i>
                <h3>${ingredient.strIngredient}</h3>
                <p>${ingredient.strDescription.split(" ").slice(0, 20).join(" ")}</p>
            </div>
        </div>
    `).join('');

    rowData.innerHTML = `<div class="row d-flex flex-row flex-wrap justify-content-between">${ingredientsHtml}</div>`;
}

async function getCategoryMeals(category) {
    clearContainers();
    const data = await fetchApi(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
    displayMeals(data.meals.slice(0, 20));
}

async function getAreaMeals(area) {
    clearContainers();
    const data = await fetchApi(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`);
    displayMeals(data.meals.slice(0, 20));
}

async function getIngredientsMeals(ingredient) {
    clearContainers();
    const data = await fetchApi(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
    displayMeals(data.meals.slice(0, 20));
}

async function getMealDetails(mealID) {
    closeSideNav();
    clearContainers();
    const data = await fetchApi(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealID}`);
    displayMealDetails(data.meals[0]);
}

function displayMealDetails(meal) {
    const ingredients = Array.from({length: 20}, (_, i) => {
        if (meal[`strIngredient${i + 1}`]) {
            return `<li class="alert alert-info m-2 p-1">${meal[`strMeasure${i + 1}`]} ${meal[`strIngredient${i + 1}`]}</li>`;
        }
        return '';
    }).join('');

    const tagsStr = (meal.strTags?.split(",") || []).map(tag => `
        <li class="alert alert-danger m-2 p-1">${tag}</li>
    `).join('');

    const mealHtml = `
        <div class="col col-md-4">
            <img class="w-100 rounded-3" src="${meal.strMealThumb}" alt="">
            <h2>${meal.strMeal}</h2>
        </div>
        <div class="col-md-8">
            <h2>Instructions</h2>
            <p>${meal.strInstructions}</p>
            <h3><span class="fw-bolder">Area: </span>${meal.strArea}</h3>
            <h3><span class="fw-bolder">Category: </span>${meal.strCategory}</h3>
            <h3>Recipes:</h3>
            <ul class="list-unstyled d-flex g-3 flex-wrap">${ingredients}</ul>
            <h3>Tags:</h3>
            <ul class="list-unstyled d-flex g-3 flex-wrap">${tagsStr}</ul>
            <a target="_blank" href="${meal.strSource}" class="btn btn-success">Source</a>
            <a target="_blank" href="${meal.strYoutube}" class="btn btn-danger">Youtube</a>
        </div>
    `;

    rowData.innerHTML = mealHtml;
}
function showSearchInputs() {
    searchContainer.innerHTML = `
    <div class="row py-4 justify-content-center">
        <div class="col col-sm-4 mb-3">
            <label for="nameSearch" class="form-label text-white">Search By Name</label>
            <input id="nameSearch" onkeyup="searchByName(this.value)" class="form-control bg-transparent text-white" type="text" placeholder="Search By Name">
        </div>
        <div class="col col-sm-4 mb-3">
            <label for="firstLetterSearch" class="form-label text-white">Search By First Letter</label>
            <input id="firstLetterSearch" onkeyup="searchByFLetter(this.value)" maxlength="1" class="form-control bg-transparent text-white" type="text" placeholder="Search By First Letter">
        </div>
    </div>`;
    
    
    document.body.insertBefore(searchContainer, document.body.firstChild);
    
    rowData.innerHTML = "";
}



async function searchByFLetter(letter) {
    closeSideNav();
    rowData.innerHTML = "";
    $(".inner-loading-screen").fadeIn(300);
    const responseLetter = letter || "a";
    const data = await fetchApi(`https://www.themealdb.com/api/json/v1/1/search.php?f=${responseLetter}`);
    displayMeals(data.meals || []);
    $(".inner-loading-screen").fadeOut(300);
}

function showContacts() {
    rowData.innerHTML = `
    <div class="contact min-vh-100 d-flex justify-content-center align-items-center">
        <div class="container w-75 text-center">
            <div class="row g-4">
                <div class="col-md-6">
                    <input id="nameInput" onkeyup="inputsValidation()" type="text" class="form-control" placeholder="Enter Your Name">
                    <div id="nameAlert" class="alert alert-danger w-100 mt-2 d-none">Special characters and numbers not allowed</div>
                </div>
                <div class="col-md-6">
                    <input id="emailInput" onkeyup="inputsValidation()" type="email" class="form-control" placeholder="Enter Your Email">
                    <div id="emailAlert" class="alert alert-danger w-100 mt-2 d-none">Email not valid *exemple@yyy.zzz</div>
                </div>
                <div class="col-md-6">
                    <input id="phoneInput" onkeyup="inputsValidation()" type="text" class="form-control" placeholder="Enter Your Phone Number">
                    <div id="phoneAlert" class="alert alert-danger w-100 mt-2 d-none">Phone number must be 10 digits</div>
                </div>
                <div class="col-md-6">
                    <textarea onkeyup="inputsValidation()" id="messageInput" class="form-control" placeholder="Your Message" cols="30" rows="4"></textarea>
                    <div id="messageAlert" class="alert alert-danger w-100 mt-2 d-none">Message must be more than 10 characters</div>
                </div>
                <div class="col-md-12">
                    <button id="submitBtn" class="btn btn-success" disabled>Submit</button>
                </div>
            </div>
        </div>
    </div>`;
    submitBtn = document.getElementById("submitBtn");
}


function inputsValidation() {
    const nameInput = document.getElementById("nameInput").value;
    const emailInput = document.getElementById("emailInput").value;
    const phoneInput = document.getElementById("phoneInput").value;
    const messageInput = document.getElementById("messageInput").value;

    const isNameValid = /^[a-zA-Z\s]+$/.test(nameInput);
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput);
    const isPhoneValid = /^\d{10}$/.test(phoneInput);
    const isMessageValid = messageInput.length > 10;

    document.getElementById("nameAlert").classList.toggle("d-none", isNameValid);
    document.getElementById("emailAlert").classList.toggle("d-none", isEmailValid);
    document.getElementById("phoneAlert").classList.toggle("d-none", isPhoneValid);
    document.getElementById("messageAlert").classList.toggle("d-none", isMessageValid);

    submitBtn.disabled = !(isNameValid && isEmailValid && isPhoneValid && isMessageValid);
}

function closeSideNav() {
    
    $(".side-nav-menu").animate({
        left: "-310px"
    }, 500);

    
    $(".open-close-icon").addClass("fa-align-justify");
    $(".open-close-icon").removeClass("fa-x");

   
    $(".links li").animate({
        top: 300
    }, 500);
}
 
closeSideNav();

 
$(".side-nav-menu i.open-close-icon").click(() => {
   
    if ($(".side-nav-menu").css("left") === "0px") {
        closeSideNav();
    } else {
        openSideNav();
    }
});

 
function openSideNav() {
    $(".side-nav-menu").animate({
        left: 0
    }, 500);

    $(".open-close-icon").removeClass("fa-align-justify").addClass("fa-x");
 
    $(".links li").each(function(index) {
        $(this).animate({
            top: 0
        }, (index + 5) * 100);
    });
}



// Helper function to format the price with commas and "Rs."
function formatPrice(price) {
  console.log("Original Price:", price);

  // Ensure the price is a valid number
  const formattedPrice = parseFloat(price.replace(/[^0-9.-]+/g, "")); // Remove any non-numeric characters before parsing
  if (isNaN(formattedPrice)) {
    return "Rs. 0"; // Return "Rs. 0" if the price is not a valid number
  }
  return "Rs. " + formattedPrice.toLocaleString(); // Format with commas
}

// Load and parse CSV file
async function loadCSVData() {
  const response = await fetch("products.csv");
  const csvText = await response.text();

  // Parse CSV data
  const parsedData = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  }).data;

  // Organize data into categories and subcategories
  return formatData(parsedData);
}

// Format parsed data into categories and subcategories
function formatData(data) {
  const categories = {};

  data.forEach((row) => {
    const { category, subcategory, brand, size, hsCode, price } = row;

    // Check if the category exists, if not, initialize it
    if (!categories[category]) {
      categories[category] = { name: category, subcategories: {} };
    }

    // Check if the subcategory exists within the category
    if (!categories[category].subcategories[subcategory]) {
      categories[category].subcategories[subcategory] = {
        name: subcategory,
        products: [],
      };
    }

    // Add product to the corresponding subcategory
    categories[category].subcategories[subcategory].products.push({
      brand,
      size,
      hsCode,
      price,
    });
  });

  // Convert categories object to an array of objects
  return Object.values(categories).map((category) => ({
    name: category.name,
    subcategories: Object.values(category.subcategories),
  }));
}

// Function to generate HTML for the product list, with "No products found" message
function generateProductList(categories) {
  if (categories.length === 0) {
    return '<div class="no-results">No products matching the search term.</div>';
  }

  let html = '<div class="content" id="beverageTable">';

  html += `
            <table class="product-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Size</th>
                  <th>HS CODE</th>
                  <th>MRP</th>
                </tr>
              </thead>
            </table>
          `;

  categories.forEach((category) => {
    html += `
              <div class="category">
                <h2 class="category-title">${category.name}</h2>
              </div>
            `;

    html += '<div class="subcategories-container">';

    category.subcategories.forEach((subcategory) => {
      html += `
                <div class="subcategory">
                  ${
                    subcategory.name
                      ? `<h2 class="subcategory-title">${subcategory.name}</h2>`
                      : ""
                  }
                  <table class="product-table">
                    <tbody>
              `;

      subcategory.products.forEach((product) => {
        html += `
                  <tr>
                    <td>${product.brand}</td>
                    <td>${product.size}</td>
                    <td>${product.hsCode}</td>
                    <td>${formatPrice(product.price)}</td>
                  </tr>
                `;
      });

      html += `
                    </tbody>
                  </table>
                </div>
              `;
    });

    html += "</div>";
  });

  html += "</div>";
  return html;
}

// Initialize product list generation
async function initializeProductList() {
  const formattedData = await loadCSVData();
  const generatedHTML = generateProductList(formattedData);

  document.querySelector(".container").innerHTML = generatedHTML;
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, arguments), wait);
  };
}

// Initialize Slick slider
function initializeSlider() {
  $(".slider").slick({
    autoplay: true,
    autoplaySpeed: 0,
    speed: 2500,
    slidesToShow: 8,
    cssEase: "linear",
    centerMode: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 400,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  });
}

// Initialize slider on document ready
$(document).ready(function () {
  initializeSlider();

  // Reinitialize slider on resize with debounce
  $(window).on(
    "resize",
    debounce(function () {
      // Destroy and reinitialize
      $(".slider").slick("unslick");
      initializeSlider();
    }, 250) // Adjust debounce wait time (in ms) as needed
  );
});

// Search function to filter products based on search term
function searchProducts(term, categories) {
  const filteredCategories = categories
    .map((category) => {
      // Filter subcategories within each category
      const filteredSubcategories = category.subcategories
        .map((subcategory) => {
          // Filter products within each subcategory
          const filteredProducts = subcategory.products.filter(
            (product) =>
              product.brand.toLowerCase().includes(term) ||
              category.name.toLowerCase().includes(term) ||
              subcategory.name.toLowerCase().includes(term)
          );

          // Return subcategory if it has any matching products
          if (filteredProducts.length) {
            return {
              ...subcategory,
              products: filteredProducts,
            };
          }
          return null;
        })
        .filter((subcategory) => subcategory); // Remove null subcategories

      // Return category if it has any matching subcategories
      if (filteredSubcategories.length) {
        return {
          ...category,
          subcategories: filteredSubcategories,
        };
      }
      return null;
    })
    .filter((category) => category); // Remove null categories

  // Return filtered categories or an empty array if no matches are found
  return filteredCategories.length > 0 ? filteredCategories : [];
}

// Event listener for search input
function initializeSearch(categories) {
  const searchInput = document.getElementById("search");
  searchInput.addEventListener(
    "input",
    debounce(function () {
      const searchTerm = searchInput.value.toLowerCase().trim();
      const filteredData = searchTerm
        ? searchProducts(searchTerm, categories)
        : categories;
      const generatedHTML = generateProductList(filteredData);
      document.querySelector(".container").innerHTML = generatedHTML;
    }, 300) // Adjust debounce time as needed
  );
}

// Modified initializeProductList to include search initialization
async function initializeProductList() {
  const formattedData = await loadCSVData();
  const generatedHTML = generateProductList(formattedData);

  document.querySelector(".container").innerHTML = generatedHTML;

  // Initialize search with loaded data
  initializeSearch(formattedData);
}

// Call initialize function on page load
document.addEventListener("DOMContentLoaded", initializeProductList);

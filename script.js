// const searchInput = document.getElementById("search");
// const table = document.getElementById("beverageTable");
// const rows = table.getElementsByTagName("tr");

// searchInput.addEventListener("keyup", function () {
//   const searchTerm = this.value.toLowerCase();
//   let lastCategory = null;
//   let lastSubcategory = null;

//   for (let i = 1; i < rows.length; i++) {
//     const row = rows[i];
//     const isCategory = row.classList.contains("category");
//     const isSubcategory = row.classList.contains("subcategory");

//     if (isCategory) {
//       lastCategory = row;
//       row.classList.add("hidden");
//       continue;
//     }

//     if (isSubcategory) {
//       lastSubcategory = row;
//       row.classList.add("hidden");
//       continue;
//     }

//     const cells = row.getElementsByTagName("td");
//     let found = false;

//     for (let j = 0; j < cells.length; j++) {
//       if (cells[j].textContent.toLowerCase().indexOf(searchTerm) > -1) {
//         found = true;
//         break;
//       }
//     }

//     if (found) {
//       row.classList.remove("hidden");
//       if (lastCategory) lastCategory.classList.remove("hidden");
//       if (lastSubcategory) lastSubcategory.classList.remove("hidden");
//     } else {
//       row.classList.add("hidden");
//     }
//   }
// });

const searchInput = document.getElementById("search");
const table = document.getElementById("beverageTable");
const categories = document.querySelectorAll(".category");
const subcategories = document.querySelectorAll(".subcategory");

searchInput.addEventListener("keyup", function () {
  const searchTerm = this.value.toLowerCase();

  // Loop through each category
  categories.forEach((category) => {
    let categoryVisible = false; // Track if we have any visible rows within this category

    // Loop through each subcategory within this category
    const subcategoriesInCategory =
      category.nextElementSibling.querySelectorAll(".subcategory");
    subcategoriesInCategory.forEach((subcategory) => {
      let subcategoryVisible = false; // Track if any item in this subcategory is visible

      // Get all rows within this subcategory
      const rows = subcategory.querySelectorAll("tr");
      rows.forEach((row) => {
        const cells = row.getElementsByTagName("td");
        let found = false;

        // Check each cell for the search term
        for (let cell of cells) {
          if (cell.textContent.toLowerCase().includes(searchTerm)) {
            found = true;
            break;
          }
        }

        // Show or hide row based on whether it matches search term
        if (found) {
          row.classList.remove("hidden");
          subcategoryVisible = true; // Keep subcategory visible if a match is found
        } else {
          row.classList.add("hidden");
        }
      });

      // Show or hide subcategory based on whether any rows are visible
      if (subcategoryVisible) {
        subcategory.classList.remove("hidden");
        categoryVisible = true; // Keep category visible if subcategory has any match
      } else {
        subcategory.classList.add("hidden");
      }
    });

    // Show or hide category based on whether any subcategories are visible
    if (categoryVisible) {
      category.classList.remove("hidden");
    } else {
      category.classList.add("hidden");
    }
  });
});

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

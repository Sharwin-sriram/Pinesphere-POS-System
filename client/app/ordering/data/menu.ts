export const menuCategories = [
  {
    id: 1,
    name: "Burger",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    isActive: true,
    sortOrder: 1,
  },

  {
    id: 2,
    name: "Pizza",
    imageUrl:
      "https://images.unsplash.com/photo-1604382355076-af4b0eb60143",
    isActive: true,
    sortOrder: 2,
  },

  {
    id: 3,
    name: "Beverages",
    imageUrl:
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c",
    isActive: true,
    sortOrder: 3,
  },
];

export const menuItems = [
  {
    id: 1,
    categoryId: 1,
    name: "Chicken Burger",
    description: "Crispy chicken burger with cheese",
    basePrice: 199,
    taxPercent: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    isVeg: false,
    isAvailable: true,
    nutritionalInfo: {
      calories: 450,
      protein: 25,
    },
    allergenInfo: ["Gluten", "Dairy"],
    preparationTime: 15,

    modifierGroups: [
      {
        id: 1,
        name: "Choose Size",
        isRequired: true,
        minSelect: 1,
        maxSelect: 1,

        modifiers: [
          {
            id: 1,
            name: "Regular",
            extraPrice: 0,
          },

          {
            id: 2,
            name: "Large",
            extraPrice: 50,
          },
        ],
      },

      {
        id: 2,
        name: "Extra Addons",
        isRequired: false,
        minSelect: 0,
        maxSelect: 3,

        modifiers: [
          {
            id: 3,
            name: "Extra Cheese",
            extraPrice: 30,
          },

          {
            id: 4,
            name: "Extra Patty",
            extraPrice: 80,
          },
        ],
      },
    ],
  },

  {
    id: 2,
    categoryId: 2,
    name: "Margherita Pizza",
    description: "Classic cheesy pizza",
    basePrice: 299,
    taxPercent: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1604382355076-af4b0eb60143",
    isVeg: true,
    isAvailable: true,
    nutritionalInfo: {
      calories: 600,
      protein: 18,
    },
    allergenInfo: ["Gluten"],
    preparationTime: 20,

    modifierGroups: [],
  },
];
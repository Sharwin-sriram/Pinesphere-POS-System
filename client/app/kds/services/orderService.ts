import axios from "axios";

const BASE_URL =
  "http://localhost:5000/api/orders";

// GET ALL ORDERS
export const getOrders = async () => {

  try {

    const response =
      await axios.get(BASE_URL);

    return response.data;

  } catch (error) {

    console.log(
      "Backend not connected yet"
    );

    return [];

  }

};

// UPDATE ORDER STATUS
export const updateOrderStatusAPI =
  async (
    orderId: string,
    status: string
  ) => {

    try {

      const response =
        await axios.put(
          `${BASE_URL}/${orderId}`,
          {
            status,
          }
        );

      return response.data;

    } catch (error) {

      console.log(
        "Backend update unavailable"
      );

    }

  };
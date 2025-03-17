import { useEffect, useState } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";

const List = ({ url }) => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}api/food/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Error fetching food list");
      }
    } catch (error) {
      toast.error("Network error while fetching food list");
    }
  };

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}api/food/remove`, { id: foodId });
      if (response.data.success) {
        setList((prevList) => prevList.filter((item) => item._id !== foodId));
        toast.success(response.data.message);
      } else {
        toast.error("Error deleting food item");
      }
    } catch (error) {
      toast.error("Network error while deleting food item");
    }
  };

  useEffect(() => {
    fetchList();
  }, []); // Added `url` as a dependency

  return (
    <div className="list add flex-col">
      <p>All Foods List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.length > 0 ? (
          list.map((item) => (
            <div key={item._id} className="list-table-format">
              <img src={`${url}images/` + item.image} alt={item.name} />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>Rs {item.price}</p>
              <p onClick={() => removeFood(item._id)} className="cursor">
                ❌
              </p>
            </div>
          ))
        ) : (
          <p>No food items available.</p>
        )}
      </div>
    </div>
  );
};

export default List;

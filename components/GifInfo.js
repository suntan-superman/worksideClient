import delivered from "../assets/delivered.gif";
import looking from "../assets/looking.gif";
import minion_riding from "../assets/minion_riding.gif";
import reached_drop from "../assets/reached_drop.gif";
import reached_pickup from "../assets/reached_pickup.gif";
import truck_moving from "../assets/truck_moving.gif";
import { DashboardStatus } from "../src/types";
import { Image } from "react-native";

const GifInfo = (props) => {
  const { dashboardStatus } = props;
  const statusGifMapper = {
    NO_SHIPMENT: "",
    SHIPMENT_INITIATED: "",
    PICKUP_SELECTED: "",
    DROP_SELECTED: looking,
    SEARCHING_ASSOCIATES: "",
    ASSOCIATE_ASSIGNED: minion_riding,
    PICKUP_LOCATION_REACHED: reached_pickup,
    TRANSPORTING: truck_moving,
    DROP_LOCATION_REACHED: reached_drop,
    DELIVERED: delivered,
    CANCELLED: "",
  };

  return (
    <>
      {statusGifMapper[dashboardStatus] ? (
        <Image
          src={statusGifMapper[dashboardStatus]}
          alt="gif-info"
          style={{
            maxWidth: "400px",
            maxHeight: "400px",
          }}
        />
      ) : null}
    </>
  );
};
export default GifInfo;

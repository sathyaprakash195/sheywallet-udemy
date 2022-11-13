import React, { useEffect } from "react";
import { message, Tabs, Table } from "antd";
import PageTitle from "../../components/PageTitle";
import NewRequestModal from "./NewRequestModal";
import {
  GetAllRequestsByUser,
  UpdateRequestStatus,
} from "../../apicalls/requests";
import { useDispatch, useSelector } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import moment from "moment";
import { ReloadUser } from "../../redux/usersSlice";

const { TabPane } = Tabs;

function Requests() {
  const [data, setData] = React.useState([]);
  const [showNewRequestModal, setShowNewRequestModal] = React.useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);
  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetAllRequestsByUser();
      if (response.success) {
        const sendData = response.data.filter(
          (item) => item.sender._id === user._id
        );
        const receivedData = response.data.filter(
          (item) => item.receiver._id === user._id
        );
        setData({
          sent: sendData,
          received: receivedData,
        });
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };
  const updateStatus = async (record, status) => {
    try {
      if (status === "accepted" && record.amount > user.balance) {
        message.error("Insufficient funds");
        return;
      } else {
        dispatch(ShowLoading());
        const response = await UpdateRequestStatus({
          ...record,
          status,
        });
        dispatch(HideLoading());
        if (response.success) {
          message.success(response.message);
          getData();
          dispatch(ReloadUser(true));
        } else {
          message.error(response.message);
        }
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: "Request ID",
      dataIndex: "_id",
    },
    {
      title: "Sender",
      dataIndex: "sender",
      render(sender) {
        return sender.firstName + " " + sender.lastName;
      },
    },
    {
      title: "Receiver",
      dataIndex: "receiver",
      render(receiver) {
        return receiver.firstName + " " + receiver.lastName;
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
    },
    {
      title: "Date",
      dataIndex: "date",
      render(text, record) {
        return moment(record.createdAt).format("DD-MM-YYYY hh:mm:ss A");
      },
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => {
        if (record.status === "pending" && record.receiver._id === user._id) {
          return (
            <div className="flex gap-1">
              <h1
                className="text-sm underline"
                onClick={() => updateStatus(record, "rejected")}
              >
                Reject
              </h1>
              <h1
                className="text-sm underline"
                onClick={() => updateStatus(record, "accepted")}
              >
                Accept
              </h1>
            </div>
          );
        }
      },
    },
  ];

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <div className="flex justify-between">
        <PageTitle title="Requests" />
        <button
          className="primary-outlined-btn"
          onClick={() => setShowNewRequestModal(true)}
        >
          Request Funds
        </button>
      </div>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Sent" key="1">
          <Table columns={columns} dataSource={data.sent} />
        </TabPane>
        <TabPane tab="Received" key="2">
          <Table columns={columns} dataSource={data.received} />
        </TabPane>
      </Tabs>

      {showNewRequestModal && (
        <NewRequestModal
          showNewRequestModal={showNewRequestModal}
          setShowNewRequestModal={setShowNewRequestModal}
          reloadData={getData}
        />
      )}
    </div>
  );
}

export default Requests;

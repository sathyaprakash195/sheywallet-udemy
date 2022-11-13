import React, { useEffect } from "react";
import { Modal, Form, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { TransferFunds, VerifyAccount } from "../../apicalls/transactions";
import { ShowLoading, HideLoading } from "../../redux/loadersSlice";
import { SendRequest } from "../../apicalls/requests";

function NewRequestModal({
  showNewRequestModal,
  setShowNewRequestModal,
  reloadData,
}) {
  const { user } = useSelector((state) => state.users);

  const [isVerified, setIsVerified] = React.useState("");
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const verifyAccount = async () => {
    try {
      dispatch(ShowLoading());
      const response = await VerifyAccount({
        receiver: form.getFieldValue("receiver"),
      });
      dispatch(HideLoading());
      if (response.success) {
        setIsVerified("true");
      } else {
        setIsVerified("false");
      }
    } catch (error) {
      dispatch(HideLoading());
      setIsVerified("false");
    }
  };

  const onFinish = async (values) => {
    try {

      if(values.amount > user.balance){
        message.error("Insufficient funds");
        return;
      }

      dispatch(ShowLoading());
      const payload = {
        ...values,
        sender: user._id,
        status: "success",
        reference: values.reference || "no reference",
      };
      const response = await SendRequest(payload);
      if (response.success) {
        reloadData();
        setShowNewRequestModal(false);
        message.success(response.message);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  return (
    <div>
      <Modal
        title="Transfer Funds"
        open={showNewRequestModal}
        onCancel={() => setShowNewRequestModal(false)}
        onClose={() => setShowNewRequestModal(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <div className="flex gap-2 items-center">
            <Form.Item label="Account Number" name="receiver" className="w-100">
              <input type="text" />
            </Form.Item>
            <button
              className="primary-contained-btn mt-1"
              type="button"
              onClick={verifyAccount}
            >
              VERIFY
            </button>
          </div>

          {isVerified === "true" && (
            <div className="success-bg">Account verified successfully</div>
          )}

          {isVerified === "false" && (
            <div className="error-bg">Invalid Account</div>
          )}

          <Form.Item
            label="Amount"
            name="amount"
            rules={[
              {
                required: true,
                message: "Please input your amount!",
              },
              {
                max: user.balance,
                message: "Insufficient Balance",
              },
            ]}
          >
            <input type="number" max={user.balance} />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <textarea type="text" />
          </Form.Item>

          <div className="flex justify-end gap-1">
            <button className="primary-outlined-btn">Cancel</button>
            {isVerified === "true" && (
              <button className="primary-contained-btn" type="submit">
                Request
              </button>
            )}
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default NewRequestModal;

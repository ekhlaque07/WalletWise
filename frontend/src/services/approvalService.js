import API from "./api";

export const getApprovals = async () => {
  const response = await API.get("/approvals");

  return response.data;
};


export const approveApproval = async (id) => {
  try {

    const response = await API.patch(
      `/approvals/${id}/approve`
    );

    return response.data;

  } catch (error) {

    console.error(
      "Approve approval error:",
      error.response?.data || error
    );

    throw new Error(
      error.response?.data?.message ||
      "Failed to approve action."
    );
  }
};


export const rejectApproval = async (
  id,
  reason = "Rejected by user."
) => {
  try {

    const response = await API.patch(
      `/approvals/${id}/reject`,
      {
        reason,
      }
    );

    return response.data;

  } catch (error) {

    console.error(
      "Reject approval error:",
      error.response?.data || error
    );

    throw new Error(
      error.response?.data?.message ||
      "Failed to reject action."
    );
  }
};
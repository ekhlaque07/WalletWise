import { useEffect, useState } from "react";

import {
  User,
  Mail,
  Lock,
  Trash2,
  Save,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../services/userService";

import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);

  const [username, setUsername] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingUsername, setSavingUsername] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // LOAD PROFILE
  // ==========================================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        setProfile(data.user);
        setUsername(
          data.user.username ||
            data.user.name ||
            data.user.email?.split("@")[0] ||
            "",
        );
      } catch (err) {
        console.error(err);

        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ==========================================
  // UPDATE USERNAME
  // ==========================================
  const handleUsernameUpdate = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }

    try {
      setSavingUsername(true);

      const data = await updateProfile(username);

      setProfile(data.user);

      setMessage("Username updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update username");
    } finally {
      setSavingUsername(false);
    }
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill all password fields");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      setChangingPassword(true);

      const data = await changePassword(
        currentPassword,
        newPassword,
        confirmPassword,
      );

      setMessage(data.message);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  // ==========================================
  // DELETE ACCOUNT
  // ==========================================
  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (deleteConfirmation !== "DELETE") {
      setError("Please type DELETE exactly to confirm");
      return;
    }

    const confirmed = window.confirm(
      "Are you absolutely sure? This will permanently delete your account and all your financial data.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingAccount(true);

      await deleteAccount(deleteConfirmation);

      // Remove authentication
      localStorage.removeItem("token");

      // Redirect to login
      window.location.href = "/login";
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account");

      setDeletingAccount(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      {/* HEADER */}
      <div className="profile-header">
        <div>
          <h1>Profile & Settings</h1>
          <p>Manage your WalletWise account and security.</p>
        </div>

        <div className="profile-avatar-large">
          {(profile?.username || profile?.name || profile?.email || "U")
            .charAt(0)
            .toUpperCase()}
        </div>
      </div>

      {/* MESSAGE */}
      {message && <div className="profile-message success">{message}</div>}

      {error && <div className="profile-message error">{error}</div>}

      <div className="profile-grid">
        {/* =====================================
            ACCOUNT INFORMATION
        ====================================== */}
        <div className="profile-card">
          <div className="card-title">
            <User size={20} />
            <div>
              <h2>Account Information</h2>
              <p>Your basic WalletWise information</p>
            </div>
          </div>

          <div className="profile-info">
            <div className="info-row">
              <div className="info-icon">
                <User size={18} />
              </div>

              <div>
                <span>Username</span>
                <strong>
                  {profile?.username ||
                    profile?.name ||
                    profile?.email?.split("@")[0] ||
                    "User"}
                </strong>
              </div>
            </div>

            <div className="info-row">
              <div className="info-icon">
                <Mail size={18} />
              </div>

              <div>
                <span>Email</span>
                <strong>{profile?.email}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================
            EDIT USERNAME
        ====================================== */}
        <div className="profile-card">
          <div className="card-title">
            <User size={20} />
            <div>
              <h2>Edit Username</h2>
              <p>Change how your name appears in WalletWise</p>
            </div>
          </div>

          <form onSubmit={handleUsernameUpdate}>
            <label>Username</label>

            <div className="input-wrapper">
              <User size={18} />

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>

            <button
              type="submit"
              className="primary-btn"
              disabled={savingUsername}
            >
              <Save size={18} />

              {savingUsername ? "Saving..." : "Save Username"}
            </button>
          </form>
        </div>

        {/* =====================================
            CHANGE PASSWORD
        ====================================== */}
        <div className="profile-card password-card">
          <div className="card-title">
            <Lock size={20} />

            <div>
              <h2>Change Password</h2>
              <p>Keep your WalletWise account secure</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange}>
            {/* CURRENT PASSWORD */}
            <label>Current Password</label>

            <div className="input-wrapper">
              <Lock size={18} />

              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* NEW PASSWORD */}
            <label>New Password</label>

            <div className="input-wrapper">
              <Lock size={18} />

              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* CONFIRM PASSWORD */}
            <label>Confirm New Password</label>

            <div className="input-wrapper">
              <Lock size={18} />

              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              className="primary-btn"
              disabled={changingPassword}
            >
              <ShieldCheck size={18} />

              {changingPassword ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>

        {/* =====================================
            DELETE ACCOUNT
        ====================================== */}
        <div className="profile-card danger-card">
          <div className="card-title danger-title">
            <Trash2 size={20} />

            <div>
              <h2>Delete Account</h2>

              <p>Permanently remove your WalletWise account</p>
            </div>
          </div>

          <div className="danger-warning">
            <strong>Warning</strong>

            <p>
              This action cannot be undone. Your account, transactions, budgets
              and goals will be permanently deleted.
            </p>
          </div>

          <form onSubmit={handleDeleteAccount}>
            <label>
              Type <strong>DELETE</strong> to confirm
            </label>

            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE"
              className="delete-input"
            />

            <button
              type="submit"
              className="delete-btn"
              disabled={deletingAccount}
            >
              <Trash2 size={18} />

              {deletingAccount ? "Deleting..." : "Delete Account Permanently"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

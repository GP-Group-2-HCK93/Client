import { useEffect, useState } from 'react';
import axios from 'axios';
import { url } from '../../constants/url';
import { useNavigate } from 'react-router';
import popupToast from "../../components/PopupToast"; // MODIFIED: replaced Toastify with PopupToast
import { useTranslation } from 'react-i18next'; // ADDED: i18n

export default function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    profilePic: '',
    specialization: '',
    experience: '',
    bio: '',
    location: '',
    isAvailable: false,
  });

  const navigate = useNavigate();
  const { t } = useTranslation(); // ADDED: i18n

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${url}/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      setRole(data.role);
      setFormData({
        name: data.name || '',
        profilePic: data.profilePic || '',
        specialization: data.Doctor?.specialization || '',
        experience: data.Doctor?.experience || '',
        bio: data.Doctor?.bio || '',
        location: data.Doctor?.location || '',
        isAvailable: data.Doctor?.isAvailable || false,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfilePicFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('specialization', formData.specialization);
      payload.append('experience', formData.experience);
      payload.append('bio', formData.bio);
      payload.append('location', formData.location);
      payload.append('isAvailable', formData.isAvailable);

      if (profilePicFile) {
        payload.append('profilePic', profilePicFile);
      }

      await axios.put(`${url}/profile`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      popupToast({ text: 'Profile updated successfully', type: "success" });

      navigate('/');
    } catch (error) {
      popupToast({ text: error.response?.data?.message || 'Failed to update profile', type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto m-10">
      {/* MODIFIED: Enhanced card with gradient accent */}
      <div className="rounded-xl border border-base-200 p-6 shadow-md overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 -mt-6 -mx-6 mb-6" />{/* ADDED: gradient bar */}
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{t("editProfile")}</h1>{/* MODIFIED: gradient text */}

        {/* Avatar Preview */}
        <div className="flex justify-center mb-6">
          <div className="avatar">
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img
                src={
                  preview ||
                  formData.profilePic ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=6366f1&color=fff&size=96`
                }
                alt={formData.name}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* User Fields */}
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Profile Picture</span>
            </label>
            <div className="mt-2 rounded-md border border-dashed border-gray-400 p-4">
              <div className="flex flex-col items-center gap-3">
                <label className="cursor-pointer">
                  <span className="btn btn-outline btn-sm">
                    {preview ? 'Change Photo' : 'Upload Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Doctor Fields - only show if role is Doctor */}
          {role === 'Doctor' && (
            <>
              <div className="divider">Doctor Information</div>

              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Specialization</span>
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Experience (years)</span>
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Bio</span>
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="textarea textarea-bordered w-full"
                />
              </div>

              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Location</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control mb-3">
                <label className="label cursor-pointer">
                  <span className="label-text">Available</span>
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="checkbox checkbox-primary"
                  />
                </label>
              </div>
            </>
          )}

          <div className="flex justify-between mt-6">
            <button type="button" onClick={() => navigate(-1)} className="btn">
              Cancel
            </button>
            <button type="submit" className="btn border-0 text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-md shadow-indigo-500/25">{/* MODIFIED: gradient button */}
              {t("saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

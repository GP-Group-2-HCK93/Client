import { useEffect, useState } from 'react';
import axios from 'axios';
import { url } from '../../constants/url';
import { useNavigate } from 'react-router';
import Toastify from 'toastify-js';

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

      Toastify({
        text: 'Profile updated successfully',
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'center',
        style: {
          background: '#22c55e',
        },
      }).showToast();

      navigate('/');
    } catch (error) {
      Toastify({
        text: error.response?.data?.message || 'Failed to update profile',
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'center',
        style: {
          background: '#FF0000',
        },
      }).showToast();
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
      <div className="rounded-lg border border-base-300 p-6 shadow-sm">
        <h1 className="text-3xl font-semibold mb-6 text-center">Edit Profile</h1>

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
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

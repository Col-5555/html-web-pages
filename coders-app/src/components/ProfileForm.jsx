import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaPencil } from "react-icons/fa6";
import { useGetProfileQuery, useUpdateProfileMutation } from "../redux/api";
import { setUser } from "../redux/authSlice";

// The profile form: avatar upload + editable name/bio, a read-only email, the
// coder's rank, and an Update button. Loads the coder's own profile from the
// backend and PATCHes it (multipart, so the avatar image rides along).
export default function ProfileForm() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const coderId = user?._id;

  const { data: profile } = useGetProfileQuery(coderId, { skip: !coderId });
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Seed the form once the profile arrives (and after a save refetch).
  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.first_name ?? "");
    setLastName(profile.last_name ?? "");
    setBio(profile.description ?? "");
    setAvatarPreview(profile.avatar ?? "");
  }, [profile]);

  // Track the object URL we create so we can revoke it (avoid memory leaks).
  const objectUrlRef = useRef(null);
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const email = user?.email ?? "email@domain.com";

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setAvatarPreview(url);
    setAvatarFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaved(false);
    setError("");

    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("about", bio);
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      const { profile: updated } = await updateProfile({
        id: coderId,
        formData,
      }).unwrap();
      // Keep the Navbar name/avatar in sync with the saved profile.
      dispatch(setUser(updated));
      setAvatarFile(null);
      setSaved(true);
    } catch (err) {
      setError(err?.data?.message ?? "Could not update your profile.");
    }
  };

  const inputClasses =
    "w-full bg-transparent border-b border-black/20 py-1 outline-none focus:border-purple dark:border-white/20";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg bg-white p-6 shadow dark:bg-navy/60"
    >
      {/* Avatar + rank */}
      <div className="flex items-start justify-between">
        <div>
          <div className="relative h-28 w-28">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Your avatar"
                className="h-28 w-28 rounded-full object-cover"
              />
            ) : (
              <div className="h-28 w-28 rounded-full bg-gray-300 dark:bg-gray-500" />
            )}
            {/* Edit icon = file input */}
            <label className="absolute bottom-1 right-1 cursor-pointer rounded-full bg-white p-1.5 text-navy shadow dark:bg-navy dark:text-white">
              <FaPencil className="text-xs" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <h2 className="mt-2 text-xl font-bold">
            {firstName} {lastName}
          </h2>
        </div>

        <span className="text-lg font-semibold">
          Rank: {profile?.rank ?? "—"}
        </span>
      </div>

      {/* Fields */}
      <div className="mt-4 space-y-4">
        <div>
          <label className="text-xs text-muted">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="text-xs text-muted">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="text-xs text-muted">Email Address</label>
          <input
            type="email"
            value={email}
            readOnly
            className={`${inputClasses} cursor-not-allowed text-muted`}
          />
        </div>
        <div>
          <label className="text-xs text-muted">Tell us more about you</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="About"
            rows={3}
            className={`${inputClasses} resize-y`}
          />
        </div>
      </div>

      {/* Update */}
      <div className="mt-4 flex items-center justify-end gap-3">
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400">
            Profile updated!
          </span>
        )}
        {error && <span className="text-sm text-red-500">{error}</span>}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded bg-skyblue px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-70"
        >
          {isLoading ? "Saving…" : "Update"}
        </button>
      </div>
    </form>
  );
}

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
 Camera,
 KeyRound,
 Mail,
 Phone,
 ShieldCheck,
 User,
 Users,
 MapPin,
 Clock,
 Trash2,
 Plus,
 Edit2,
 X,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { authService, getUserAvatarUrl, httpClient } from "../../lib/authService";
import { restaurantService, Restaurant } from "../../lib/restaurantService";

type ProfileForm = {
 full_name: string;
 first_name: string;
 last_name: string;
 email: string;
 phone: string;
 username: string;
 profile_image: string | null;
 current_password: string;
 new_password: string;
 confirm_password: string;
};

type Address = {
 id: string;
 address_type: "home" | "work" | "other";
 street_address: string;
 apartment_suite: string;
 city: string;
 state: string;
 postal_code: string;
 country: string;
 phone: string;
 is_default: boolean;
 full_address: string;
};

const iconClass = "h-4 w-4";
const fieldShellClass =
	"field-shell flex items-center gap-2 rounded-ds-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 transition-smooth focus-within:border-[var(--color-border-focus)] focus-within:shadow-none focus-within:ring-0";
const fieldInputClass =
	"w-full min-w-0 appearance-none border-0 bg-transparent text-sm text-[var(--color-text-primary)] outline-none ring-0 shadow-none placeholder:text-[var(--color-text-muted)] focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none [&:focus-visible]:outline-none disabled:cursor-not-allowed";
const fieldSelectClass =
	"w-full min-w-0 appearance-none border-0 bg-transparent text-sm text-[var(--color-text-primary)] outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed";

function splitName(fullName: string) {
 const parts = fullName.trim().split(/\s+/).filter(Boolean);
 return {
	first_name: parts[0] || "",
	last_name: parts.slice(1).join(" "),
 };
}

function buildFullName(firstName: string, lastName: string) {
 return [firstName, lastName].filter(Boolean).join(" ").trim();
}

function getInitials(name: string) {
 return name
	.split(/\s+/)
	.filter(Boolean)
	.slice(0, 2)
	.map((part) => part.charAt(0).toUpperCase())
	.join("") || "U";
}

export default function AccountProfilePage() {
 const [isLoading, setIsLoading] = useState(true);
 const [isSaving, setIsSaving] = useState(false);
 const [isEditing, setIsEditing] = useState(false);
 const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
 const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
 const [removeProfileImage, setRemoveProfileImage] = useState(false);
 const [googlePictureUrl, setGooglePictureUrl] = useState<string | null>(null);
 const [isDeleting, setIsDeleting] = useState(false);
 const [userRole, setUserRole] = useState<string | null>(null);
 const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
 const [addresses, setAddresses] = useState<Address[]>([]);
 const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
 const [showAddressForm, setShowAddressForm] = useState(false);
 const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
 const [newAddress, setNewAddress] = useState<Partial<Address>>({
	address_type: "home",
	street_address: "",
	apartment_suite: "",
	city: "",
	state: "",
	postal_code: "",
	country: "India",
	phone: "",
	is_default: false,
 });
 const imageInputRef = useRef<HTMLInputElement | null>(null);
 const [profile, setProfile] = useState<ProfileForm>({
	full_name: "",
	first_name: "",
	last_name: "",
	email: "",
	phone: "",
	username: "",
	profile_image: null,
	current_password: "",
	new_password: "",
	confirm_password: "",
 });

 const isRestaurantRole = !!(userRole && ["ORGANIZATION_OWNER", "restaurant", "restaurant-admin"].includes(userRole));

 useEffect(() => {
	let cancelled = false;

	async function loadProfile() {
	 const role = authService.getUserRole();
	 setUserRole(role);

	 const profileResult = await authService.getProfile();
	 if (cancelled) return;

	 if (!profileResult.success) {
		toast.error(profileResult.error || "Unable to load profile");
		setIsLoading(false);
		return;
	 }

	 const user = profileResult.data;

	 const firstName = user?.first_name || "";
	 const lastName = user?.last_name || "";
	 const fullName = buildFullName(firstName, lastName);

	 setProfile((prev) => ({
		...prev,
		full_name: fullName,
		first_name: firstName,
		last_name: lastName,
		email: user?.email || "",
		phone: user?.mobile || "",
		username: user?.email?.split("@")[0] || user?.mobile || "",
		profile_image: user?.profile_image || null,
	 }));

	 setGooglePictureUrl(user?.picture || null);
	 setProfileImagePreview(getUserAvatarUrl(user));
	 setRemoveProfileImage(false);

	 // Fetch restaurant data if user is a restaurant role
	 if (role && ["ORGANIZATION_OWNER", "restaurant", "restaurant-admin"].includes(role)) {
		const restaurantData = await restaurantService.getRestaurants();
		if (restaurantData && restaurantData.length > 0) {
		 setRestaurant(restaurantData[0]);
		}
	 }

	 setIsLoading(false);
	}

	loadProfile();

	return () => {
	 cancelled = true;
	};
 }, []);

 // Load addresses
 useEffect(() => {
	let cancelled = false;

	async function loadAddresses() {
	 try {
		setIsLoadingAddresses(true);
		const response = await httpClient.get("/api/addresses/");
		if (!cancelled) {
		 const addressData = response?.data?.results || [];
		 setAddresses(addressData);
		}
	 } catch (error) {
		console.error("Failed to load addresses:", error);
	 } finally {
		if (!cancelled) {
		 setIsLoadingAddresses(false);
		}
	 }
	}

	loadAddresses();

	return () => {
	 cancelled = true;
	};
 }, []);

 const handleAddAddress = async () => {
	if (!newAddress.street_address || !newAddress.city || !newAddress.state || !newAddress.postal_code) {
	 toast.error("Please fill in all required fields");
	 return;
	}

	try {
	 const response = await httpClient.post("/api/addresses/", newAddress);
	 const createdAddress = response?.data?.data || response?.data;
	 setAddresses([...addresses, createdAddress]);
	 setNewAddress({
		address_type: "home",
		street_address: "",
		apartment_suite: "",
		city: "",
		state: "",
		postal_code: "",
		country: "India",
		phone: "",
		is_default: false,
	 });
	 setShowAddressForm(false);
	 toast.success("Address added successfully");
	} catch (error: any) {
	 toast.error(error?.response?.data?.detail || "Failed to add address");
	}
 };

 const handleUpdateAddress = async (addressId: string) => {
	try {
	 const response = await httpClient.put(`/api/addresses/${addressId}/`, newAddress);
	 const updatedAddress = response?.data?.data || response?.data;
	 setAddresses(addresses.map(addr => addr.id === addressId ? updatedAddress : addr));
	 setNewAddress({
		address_type: "home",
		street_address: "",
		apartment_suite: "",
		city: "",
		state: "",
		postal_code: "",
		country: "India",
		phone: "",
		is_default: false,
	 });
	 setEditingAddressId(null);
	 toast.success("Address updated successfully");
	} catch (error: any) {
	 toast.error(error?.response?.data?.detail || "Failed to update address");
	}
 };

 const handleDeleteAddress = async (addressId: string) => {
	if (!window.confirm("Are you sure you want to delete this address?")) {
	 return;
	}

	try {
	 await httpClient.delete(`/api/addresses/${addressId}/`);
	 setAddresses(addresses.filter(addr => addr.id !== addressId));
	 toast.success("Address deleted successfully");
	} catch (error: any) {
	 toast.error(error?.response?.data?.detail || "Failed to delete address");
	}
 };

 const handleEditAddress = (address: Address) => {
	setNewAddress(address);
	setEditingAddressId(address.id);
	setShowAddressForm(true);
 };

 const handleCancelAddressForm = () => {
	setNewAddress({
	 address_type: "home",
	 street_address: "",
	 apartment_suite: "",
	 city: "",
	 state: "",
	 postal_code: "",
	 country: "India",
	 phone: "",
	 is_default: false,
	});
	setEditingAddressId(null);
	setShowAddressForm(false);
 };

 const initials = useMemo(() => getInitials(profile.full_name || profile.email || profile.phone), [profile.full_name, profile.email, profile.phone]);

 const updateField = <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => {
	setProfile((prev) => ({ ...prev, [field]: value }));
 };

 const handleProfileImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
	const file = event.target.files?.[0];
	if (!file) {
		return;
	}

	if (!file.type.startsWith("image/")) {
		toast.error("Please choose a valid image file");
		event.target.value = "";
		return;
	}

	if (file.size > 2 * 1024 * 1024) {
		toast.error("Image must be 2MB or smaller");
		event.target.value = "";
		return;
	}

	setRemoveProfileImage(false);
	setProfileImageFile(file);
	setProfileImagePreview((currentPreview) => {
		if (currentPreview?.startsWith("blob:")) {
			URL.revokeObjectURL(currentPreview);
		}
		return URL.createObjectURL(file);
	});
	setIsEditing(true);
 };

 const openProfileImagePicker = () => {
	imageInputRef.current?.click();
 };

 const handleCancel = () => {
	setIsEditing(false);
	setProfileImageFile(null);
	window.location.reload();
 };

 const handleSave = async () => {
	setIsSaving(true);

	const passwordFieldsFilled =
		profile.current_password.trim() ||
		profile.new_password.trim() ||
		profile.confirm_password.trim();

	if (passwordFieldsFilled) {
		if (!profile.current_password.trim() || !profile.new_password.trim() || !profile.confirm_password.trim()) {
			setIsSaving(false);
			toast.error("Fill in all password fields before saving");
			return;
		}

		const passwordResult = await authService.changePassword(
			profile.current_password,
			profile.new_password,
			profile.confirm_password,
		);

		if (!passwordResult.success) {
			setIsSaving(false);
			toast.error(passwordResult.error || "Unable to change password");
			return;
		}
	}

	const { first_name, last_name } = splitName(profile.full_name || `${profile.first_name} ${profile.last_name}`);

	// Build FormData so profile_image file can be included
	const payload = new FormData();
	payload.append("first_name", first_name);
	payload.append("last_name", last_name);
	payload.append("email", profile.email);
	payload.append("mobile", profile.phone);
	if (profileImageFile) {
	 payload.append("profile_image", profileImageFile);
	}
	if (removeProfileImage) {
	 payload.append("remove_profile_image", "true");
	}

	const result = await authService.updateProfile(payload);
	if (!result.success) {
	 setIsSaving(false);
	 toast.error(result.error || "Unable to save profile");
	 return;
	}

	setGooglePictureUrl(result.data?.picture || null);
	setProfileImagePreview(getUserAvatarUrl(result.data));

	setProfile((prev) => ({
	 ...prev,
	 first_name,
	 last_name,
	 full_name: buildFullName(first_name, last_name),
	 email: result.data?.email || prev.email,
	 phone: result.data?.mobile || prev.phone,
	 profile_image: result.data?.profile_image || prev.profile_image,
	 current_password: "",
	 new_password: "",
	 confirm_password: "",
	}));

	setProfileImageFile(null);
	setRemoveProfileImage(false);
	setIsEditing(false);
	setIsSaving(false);
	toast.success("Profile saved");
 };

 const handleDeleteAccount = async () => {
	const confirmed = window.confirm(
		"Delete your account? This will deactivate access and remove your saved profile data.",
	);
	if (!confirmed) {
		return;
	}

	setIsDeleting(true);
	const result = await authService.deleteAccount();
	if (!result.success) {
		setIsDeleting(false);
		toast.error(result.error || "Unable to delete account");
		return;
	}
	};

 if (isLoading) {
	return (
	 <div className="mx-auto flex w-full max-w-6xl items-center justify-center py-20 text-sm text-[var(--color-text-secondary)]">
		Loading profile...
	 </div>
	);
 }

 return (
	<div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
	 <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
		 <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
			Profile
		 </p>
		 <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
			Account profile
		 </h1>
		 <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
			Manage the essentials for your POS account.
		 </p>
		</div>
		<button
		 type="button"
		 onClick={() => setIsEditing(true)}
		 className="rounded-ds-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition-smooth hover:border-[var(--color-border-hover)]"
		>
		 Edit profile
		</button>
	 </header>

	 <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
		<section className="glass-card p-6">
		 <div className="flex items-center gap-3">
			<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
			 <User className={iconClass} strokeWidth={1.5} />
			</div>
			<div>
			 <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
				Profile header
			 </h2>
			 <p className="text-sm text-[var(--color-text-secondary)]">
				Visible identity used across the POS.
			 </p>
			</div>
		 </div>

		 <div className="mt-6 flex flex-col gap-5">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
			 <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-xl font-semibold text-[var(--color-text-muted)]">
				{profileImagePreview ? (
				 // eslint-disable-next-line @next/next/no-img-element
				 <img src={profileImagePreview} alt="Profile" className="h-full w-full object-cover" />
				) : (
				 initials
				)}
				<button
				 type="button"
				 onClick={openProfileImagePicker}
				 className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition-smooth hover:bg-black/40 hover:opacity-100"
				 aria-label="Change profile picture"
				>
				 <Camera className="h-5 w-5" strokeWidth={1.5} />
				</button>
				<input
				 ref={imageInputRef}
				 type="file"
				 accept="image/*"
				 className="hidden"
				 onChange={handleProfileImageSelect}
				/>
			 </div>
			 <div className="flex flex-col gap-2">
				<label className="text-sm font-medium text-[var(--color-text-secondary)]">
				 Profile picture
				</label>
				<div className="flex flex-wrap gap-3">
				 <button
					type="button"
					onClick={openProfileImagePicker}
					className="rounded-ds-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition-smooth hover:border-[var(--color-border-hover)] cursor-pointer"
				 >
					{profileImagePreview ? "Change image" : "Upload image"}
				 </button>
				 {(profile.profile_image || profileImageFile) && (
					<button
					 type="button"
					 onClick={() => {
						setProfileImageFile(null);
						setRemoveProfileImage(true);
						setProfileImagePreview(googlePictureUrl || null);
						updateField("profile_image", null);
						setIsEditing(true);
					 }}
					 className="rounded-ds-md border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-danger)] transition-smooth hover:border-red-200 hover:bg-red-50"
					>
					 Remove upload
					</button>
				 )}
				</div>
				<p className="text-xs text-[var(--color-text-muted)]">
				 PNG or JPG up to 2MB. Hover the avatar to change.
				</p>
			 </div>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
			 <div className="flex flex-col gap-2">
				<label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
				 Full name
				</label>
				<input
				 type="text"
				 value={profile.full_name}
				 onChange={(e) => updateField("full_name", e.target.value)}
				 disabled={!isEditing}
				 className="w-full rounded-ds-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] transition-smooth focus:border-[var(--color-border-focus)] disabled:cursor-not-allowed disabled:bg-[var(--color-bg-tertiary)]"
				/>
			 </div>
			</div>
		 </div>
		</section>

		<section className="glass-card p-6">
		 <div className="flex items-center gap-3">
			<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-blue-subtle)] text-[var(--color-blue)]">
			 <Users className={iconClass} strokeWidth={1.5} />
			</div>
			<div>
			 <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
				{isRestaurantRole ? "Restaurant Information" : "Personal & contact"}
			 </h2>
			 <p className="text-sm text-[var(--color-text-secondary)]">
				{isRestaurantRole ? "Your restaurant details and role." : "Keep your contact details current."}
			 </p>
			</div>
		 </div>

		 <div className="mt-6 grid grid-cols-1 gap-4">
			{isRestaurantRole ? (
			 <>
				<div className="flex flex-col gap-2">
				 <label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
					Restaurant Name
				 </label>
				 <div className={fieldShellClass}>
					<input
					 type="text"
					 value={restaurant?.name || profile.full_name}
					 disabled={true}
					 className={fieldInputClass}
					/>
				 </div>
				</div>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				 <div className="flex flex-col gap-2">
					<label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
					 Contact Email
					</label>
					<div className={fieldShellClass}>
					 <Mail className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
					 <input
						type="email"
						value={restaurant?.email || profile.email}
						disabled={true}
						className={fieldInputClass}
					 />
					</div>
				 </div>
				 <div className="flex flex-col gap-2">
					<label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
					 Contact Phone
					</label>
					<div className={fieldShellClass}>
					 <Phone className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
					 <input
						type="tel"
						value={restaurant?.phone || profile.phone}
						disabled={true}
						className={fieldInputClass}
					 />
					</div>
				 </div>
				</div>
				<div className="flex flex-col gap-2">
				 <label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
					Address
				 </label>
				 <div className={fieldShellClass}>
					<MapPin className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
					<input
					 type="text"
					 value={restaurant?.address || ""}
					 disabled={true}
					 className={fieldInputClass}
					/>
				 </div>
				</div>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				 <div className="flex flex-col gap-2">
					<label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
					 Timezone
					</label>
					<div className={fieldShellClass}>
					 <Clock className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
					 <input
						type="text"
						value={restaurant?.timezone || "UTC"}
						disabled={true}
						className={fieldInputClass}
					 />
					</div>
				 </div>
				 <div className="flex flex-col gap-2">
					<label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
					 Status
					</label>
					<div className={fieldShellClass}>
					 <input
						type="text"
						value={restaurant?.is_active ? "Active" : "Inactive"}
						disabled={true}
						className={fieldInputClass}
					 />
					</div>
				 </div>
				</div>
				<div className="flex flex-col gap-2">
				 <label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
					Account Role
				 </label>
				 <div className={fieldShellClass}>
					<input
					 type="text"
					 value={userRole || ""}
					 disabled={true}
					 className={fieldInputClass}
					/>
				 </div>
				</div>
			 </>
			) : (
			 <>
				<div className="flex flex-col gap-2">
				 <label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
					Full name
				 </label>
				 <div className={fieldShellClass}>
					<input
					 type="text"
					 value={profile.full_name}
					 onChange={(e) => updateField("full_name", e.target.value)}
					 disabled={!isEditing}
					 className={fieldInputClass}
					/>
				 </div>
				</div>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				 <div className="flex flex-col gap-2">
					<label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
					 Email address
					</label>
					<div className={fieldShellClass}>
					 <Mail className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
					 <input
						type="email"
						value={profile.email}
						onChange={(e) => updateField("email", e.target.value)}
						disabled={!isEditing}
						className={fieldInputClass}
					 />
					</div>
				 </div>
				 <div className="flex flex-col gap-2">
					<label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
					 Phone number
					</label>
					<div className={fieldShellClass}>
					 <Phone className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
					 <input
						type="tel"
						value={profile.phone}
						onChange={(e) => updateField("phone", e.target.value)}
						disabled={!isEditing}
						className={fieldInputClass}
					 />
					</div>
				 </div>
				</div>
			 </>
			)}
		 </div>
		</section>
	 </div>

	 {/* Address Management Section */}
	 <section className="glass-card p-6">
		<div className="flex items-center justify-between gap-3 mb-6">
		 <div className="flex items-center gap-3">
			<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
			 <MapPin className={iconClass} strokeWidth={1.5} />
			</div>
			<div>
			 <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
				Delivery addresses
			 </h2>
			 <p className="text-sm text-[var(--color-text-secondary)]">
				Manage your saved delivery addresses.
			 </p>
			</div>
		 </div>
		 {!showAddressForm && (
			<button
			 onClick={() => setShowAddressForm(true)}
			 className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs font-medium text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-smooth"
			>
			 <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
			 Add address
			</button>
		 )}
		</div>

		{/* Address Form */}
		{showAddressForm && (
		 <div className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-4">
			<h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
			 {editingAddressId ? "Edit address" : "Add new address"}
			</h3>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			 <div className="flex flex-col gap-2">
				<label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
				 Address type
				</label>
				<select
				 value={newAddress.address_type || "home"}
				 onChange={(e) => setNewAddress({ ...newAddress, address_type: e.target.value as "home" | "work" | "other" })}
				 className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] outline-none"
				>
				 <option value="home">Home</option>
				 <option value="work">Work</option>
				 <option value="other">Other</option>
				</select>
			 </div>
			 <div className="flex flex-col gap-2">
				<label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
				 Phone number
				</label>
				<input
				 type="tel"
				 value={newAddress.phone || ""}
				 onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
				 placeholder="Enter phone number"
				 className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] outline-none"
				/>
			 </div>
			</div>
			<div className="mt-4 flex flex-col gap-2">
			 <label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
				Street address *
			 </label>
			 <input
				type="text"
				value={newAddress.street_address || ""}
				onChange={(e) => setNewAddress({ ...newAddress, street_address: e.target.value })}
				placeholder="Enter street address"
				className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] outline-none"
			 />
			</div>
			<div className="mt-4 flex flex-col gap-2">
			 <label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
				Apartment, suite, etc. (optional)
			 </label>
			 <input
				type="text"
				value={newAddress.apartment_suite || ""}
				onChange={(e) => setNewAddress({ ...newAddress, apartment_suite: e.target.value })}
				placeholder="Apartment, suite, floor, etc."
				className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] outline-none"
			 />
			</div>
			<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
			 <div className="flex flex-col gap-2">
				<label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
				 City *
				</label>
				<input
				 type="text"
				 value={newAddress.city || ""}
				 onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
				 placeholder="City"
				 className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] outline-none"
				/>
			 </div>
			 <div className="flex flex-col gap-2">
				<label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
				 State *
				</label>
				<input
				 type="text"
				 value={newAddress.state || ""}
				 onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
				 placeholder="State"
				 className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] outline-none"
				/>
			 </div>
			 <div className="flex flex-col gap-2">
				<label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
				 Postal code *
				</label>
				<input
				 type="text"
				 value={newAddress.postal_code || ""}
				 onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
				 placeholder="Postal code"
				 className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] outline-none"
				/>
			 </div>
			</div>
			<div className="mt-4 flex flex-col gap-2">
			 <label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
				Country
			 </label>
			 <input
				type="text"
				value={newAddress.country || "India"}
				onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
				placeholder="Country"
				className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] outline-none"
			 />
			</div>
			<div className="mt-4 flex items-center gap-2">
			 <input
				type="checkbox"
				id="is_default"
				checked={newAddress.is_default || false}
				onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
				className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-blue)] focus:ring-0"
			 />
			 <label htmlFor="is_default" className="text-sm text-[var(--color-text-secondary)]">
				Set as default address
			 </label>
			</div>
			<div className="mt-4 flex gap-2">
			 <button
				onClick={() => editingAddressId ? handleUpdateAddress(editingAddressId) : handleAddAddress()}
				className="flex-1 rounded-lg bg-[var(--color-blue)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-blue-hover)] transition-smooth"
			 >
				{editingAddressId ? "Update address" : "Add address"}
			 </button>
			 <button
				onClick={handleCancelAddressForm}
				className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] transition-smooth"
			 >
				Cancel
			 </button>
			</div>
		 </div>
		)}

		{/* Addresses List */}
		{isLoadingAddresses ? (
		 <div className="text-center py-8 text-sm text-[var(--color-text-muted)]">
			Loading addresses...
		 </div>
		) : addresses.length === 0 ? (
		 <div className="text-center py-8">
			<MapPin className="mx-auto h-8 w-8 text-[var(--color-text-muted)] mb-2" strokeWidth={1.5} />
			<p className="text-sm text-[var(--color-text-muted)]">No addresses saved yet</p>
		 </div>
		) : (
		 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
			{addresses.map((address) => (
			 <div
				key={address.id}
				className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-4 hover:border-[var(--color-border-hover)] transition-smooth"
			 >
				<div className="flex items-start justify-between gap-2 mb-2">
				 <div className="flex items-center gap-2">
					<span className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] text-xs font-semibold h-6 w-6">
					 {address.address_type === "home" ? "H" : address.address_type === "work" ? "W" : "O"}
					</span>
					<div>
					 <p className="text-sm font-semibold text-[var(--color-text-primary)] capitalize">
						{address.address_type}
					 </p>
					 {address.is_default && (
						<span className="text-xs text-[var(--color-success)] font-medium">Default</span>
					 )}
					</div>
				 </div>
				 <div className="flex gap-1">
					<button
					 onClick={() => handleEditAddress(address)}
					 className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-blue)] transition-smooth"
					 aria-label="Edit address"
					>
					 <Edit2 className="h-3.5 w-3.5" strokeWidth={1.75} />
					</button>
					<button
					 onClick={() => handleDeleteAddress(address.id)}
					 className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-red-50 hover:text-[var(--color-danger)] transition-smooth"
					 aria-label="Delete address"
					>
					 <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
					</button>
				 </div>
				</div>
				<p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
				 {address.street_address}
				 {address.apartment_suite && `, ${address.apartment_suite}`}
				</p>
				<p className="text-xs text-[var(--color-text-muted)] mt-1">
				 {address.city}, {address.state} {address.postal_code}
				</p>
				{address.phone && (
				 <p className="text-xs text-[var(--color-text-muted)] mt-1">
					📞 {address.phone}
				 </p>
				)}
			 </div>
			))}
		 </div>
		)}
	 </section>

	 <div className="grid grid-cols-1 gap-6">
		<section className="glass-card p-6">
		 <div className="flex items-center gap-3">
			<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-warning-subtle)] text-[var(--color-warning)]">
			 <ShieldCheck className={iconClass} strokeWidth={1.5} />
			</div>
			<div>
			 <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
				Account settings
			 </h2>
			 <p className="text-sm text-[var(--color-text-secondary)]">
				{isRestaurantRole ? "Your restaurant account credentials." : "Secure access and password management."}
			 </p>
			</div>
		 </div>

		 <div className="mt-6 grid grid-cols-1 gap-4">
			<div className="flex flex-col gap-2">
			 <label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
				Username
			 </label>
			 <div className={fieldShellClass}>
				<input
				 type="text"
				 value={profile.username}
				 onChange={(e) => updateField("username", e.target.value)}
				 disabled={!isEditing || isRestaurantRole}
				 className={fieldInputClass}
				/>
			 </div>
			</div>
			{!isRestaurantRole && (
			 <>
				<div className="flex items-center justify-between rounded-ds-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-3">
				 <div>
					<p className="text-sm font-medium text-[var(--color-text-primary)]">
					 Change password
					</p>
					<p className="text-xs text-[var(--color-text-muted)]">
					 Update your password using the fields below.
					</p>
				 </div>
				 <button
					type="button"
					disabled={!isEditing}
					className="rounded-ds-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] transition-smooth hover:border-[var(--color-border-hover)] disabled:cursor-not-allowed disabled:opacity-60"
				 >
					Manage
				 </button>
				</div>
				 <div className="grid grid-cols-1 gap-4">
				 <div className="flex flex-col gap-2">
					<label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
					    Current password
					</label>
					<div className={fieldShellClass}>
					 <KeyRound className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
					 <input
						type="password"
						value={profile.current_password}
						onChange={(e) => updateField("current_password", e.target.value)}
						disabled={!isEditing}
						className={fieldInputClass}
					 />
					</div>
				 </div>
				 <div className="flex flex-col gap-2">
					<label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
					 New password
					</label>
					<div className={fieldShellClass}>
					 <KeyRound className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
					 <input
						type="password"
						value={profile.new_password}
						onChange={(e) => updateField("new_password", e.target.value)}
						disabled={!isEditing}
						className={fieldInputClass}
					 />
					</div>
				 </div>
				 <div className="flex flex-col gap-2">
					<label className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
					 Confirm password
					</label>
					<div className={fieldShellClass}>
					 <KeyRound className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
					 <input
						type="password"
						value={profile.confirm_password}
						onChange={(e) => updateField("confirm_password", e.target.value)}
						disabled={!isEditing}
						className={fieldInputClass}
					 />
					</div>
				 </div>
				</div>
			 </>
			)}
		 </div>
		</section>
	 </div>

	 <section className="glass-card border border-red-200/60 p-6">
		<div className="flex items-center gap-3">
		 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
			<Trash2 className={iconClass} strokeWidth={1.5} />
		 </div>
		 <div>
			<h2 className="text-base font-semibold text-[var(--color-text-primary)]">
			 Delete account
			</h2>
			<p className="text-sm text-[var(--color-text-secondary)]">
			 Permanently remove access to this account and clear profile data.
			</p>
		 </div>
		</div>

		<div className="mt-5 flex flex-col gap-3 rounded-ds-md border border-red-100 bg-red-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
		 <p className="text-sm text-red-800">
			This action deactivates your login immediately.
		 </p>
		 <button
			type="button"
			onClick={handleDeleteAccount}
			disabled={isDeleting}
			className="rounded-ds-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-smooth hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
		 >
			{isDeleting ? "Deleting..." : "Delete account"}
		 </button>
		</div>
	 </section>

	 <div className="sticky bottom-4 z-[var(--z-sticky)] mt-6">
		<div className="flex flex-col gap-3 rounded-ds-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/95 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
		 <div className="text-sm text-[var(--color-text-secondary)]">
			Profile changes sync to your account when you save.
		 </div>
		 <div className="flex flex-wrap gap-3">
			<button
			 type="button"
			 onClick={handleCancel}
			 className="rounded-ds-md border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] transition-smooth hover:border-[var(--color-border-hover)]"
			>
			 Cancel
			</button>
			<button
			 type="button"
			 onClick={handleSave}
			 disabled={!isEditing || isSaving}
			 className="rounded-ds-md bg-[var(--color-blue)] px-4 py-2 text-sm font-semibold text-white transition-smooth hover:bg-[var(--color-blue-hover)] disabled:cursor-not-allowed disabled:opacity-60"
			>
			 {isSaving ? "Saving..." : "Save changes"}
			</button>
		 </div>
		</div>
	 </div>
	</div>
 );
}

import { useState } from 'react';
import {
  User, Save, CheckCircle2, AlertCircle, Mail, Building2, BadgeInfo, Calendar,
  Phone, MapPin, Award, BookOpen, KeyRound, Eye, EyeOff, Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured, getSupabaseErrorMessage } from '../lib/supabaseClient';

export default function ProfilePage() {
  const { user, profile, loading, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [role, setRole] = useState(profile?.role || '');
  const [organization, setOrganization] = useState(profile?.organization || '');
  const [jobTitle, setJobTitle] = useState(profile?.job_title || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [certifications, setCertifications] = useState(profile?.certifications || '');
  const [bio, setBio] = useState(profile?.bio || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [pwMessage, setPwMessage] = useState(null);
  const [pwError, setPwError] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!user?.id) { setError('You must be signed in.'); return; }
    setSaving(true);
    try {
      await updateProfile({ full_name: fullName, role, organization, job_title: jobTitle, department, phone, location, certifications, bio });
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(getSupabaseErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMessage(null);
    setPwError(null);
    if (!newPassword) { setPwError('New password is required.'); return; }
    if (newPassword.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return; }
    if (!isSupabaseConfigured || !supabase) {
      setPwError('Supabase is not configured. Cannot change password.');
      setSavingPw(false);
      return;
    }

    setSavingPw(true);
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInErr) throw new Error('Current password is incorrect.');
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) throw updateErr;
      setPwMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.message);
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) {
    return (
      <section className="p-6 md:p-10">
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          <span className="ml-2 text-xs font-semibold text-slate-600">Loading profile...</span>
        </div>
      </section>
    );
  }

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all";
  const labelClass = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide";

  return (
    <section className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
            <p className="text-sm text-slate-500">Manage your account details, preferences, and security</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 flex items-center gap-3 text-xs text-slate-500">
          <Mail className="h-4 w-4 text-slate-400" />
          <span>{user?.email || 'No email available'}</span>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">Personal Information</h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}><User className="h-3.5 w-3.5 inline mr-1" />Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Briefcase className="h-3.5 w-3.5 inline mr-1" />Job Title</label>
              <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Senior Audit Associate" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><BadgeInfo className="h-3.5 w-3.5 inline mr-1" />Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
                <option value="">Select role</option>
                <option value="Lead Auditor">Lead Auditor</option>
                <option value="Senior Auditor">Senior Auditor</option>
                <option value="Staff Auditor">Staff Auditor</option>
                <option value="Audit Manager">Audit Manager</option>
                <option value="Audit Partner">Audit Partner</option>
                <option value="Internal Auditor">Internal Auditor</option>
                <option value="Compliance Officer">Compliance Officer</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}><Building2 className="h-3.5 w-3.5 inline mr-1" />Organization</label>
              <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Your firm or company" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Briefcase className="h-3.5 w-3.5 inline mr-1" />Department</label>
              <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Assurance, Advisory" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Phone className="h-3.5 w-3.5 inline mr-1" />Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><MapPin className="h-3.5 w-3.5 inline mr-1" />Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Award className="h-3.5 w-3.5 inline mr-1" />Certifications</label>
              <input type="text" value={certifications} onChange={(e) => setCertifications(e.target.value)} placeholder="e.g. CPA, CIA, CISA" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}><BookOpen className="h-3.5 w-3.5 inline mr-1" />Bio / About</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Brief professional summary..." className={inputClass + " resize-none"} />
          </div>

          {profile?.created_at && (
            <div className="flex items-center gap-2 text-[11px] text-slate-400 border-t border-slate-100 pt-4">
              <Calendar className="h-3.5 w-3.5" />
              Member since {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          )}

          {message && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 flex gap-2.5 items-start text-xs text-emerald-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="font-semibold">{message}</p>
            </div>
          )}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-3 flex gap-2.5 items-start text-xs text-red-700">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div><p className="font-bold">Error</p><p className="mt-0.5">{error}</p></div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-700/15 hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-75">
              <Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        <div className="mt-10 border-t border-slate-200 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <KeyRound className="h-5 w-5 text-slate-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Change Password</h3>
              <p className="text-xs text-slate-500">Update your account password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
            <div>
              <label className={labelClass}>Current Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className={inputClass + " pr-10"} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" className={inputClass} />
            </div>

            {pwMessage && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 flex gap-2.5 items-start text-xs text-emerald-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="font-semibold">{pwMessage}</p>
              </div>
            )}
            {pwError && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3 flex gap-2.5 items-start text-xs text-red-700">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div><p className="font-bold">Error</p><p className="mt-0.5">{pwError}</p></div>
              </div>
            )}

            <div className="flex justify-end">
              <button type="submit" disabled={savingPw}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-75">
                <KeyRound className="h-4 w-4" />{savingPw ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

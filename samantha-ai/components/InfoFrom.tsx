"use client";
import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";

interface InfoFormColumnProps {
  data: any;
  setData: Dispatch<SetStateAction<any>>;
  onSave: () => void;
  isExtracted: boolean;
  isEditMode: boolean;
}

const inputBase =
  "border border-gray-200 p-3 rounded-xl w-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent";
const inputActive = "bg-gray-50 hover:border-gray-300 focus:bg-white";
const inputDisabled = "bg-gray-50 text-gray-400 cursor-not-allowed";

export default function InfoFormColumn({
  data,
  setData,
  onSave,
  isExtracted,
  isEditMode,
}: InfoFormColumnProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [patients, setPatients] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  const [searchPatient, setSearchPatient] = useState(data.patient_name || "");
  const [searchCategory, setSearchCategory] = useState(data.category || "");
  const [searchDoctor, setSearchDoctor] = useState(data.doctors || "");

  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categoryDropdownUp, setCategoryDropdownUp] = useState(false);
  const [showDoctorDropDown, setShowDoctorDropDown] = useState(false);

  const [storeIn, setStoreIn] = useState("Correspondence");

  const gpRef = useRef<HTMLDivElement | null>(null);
  const patientRef = useRef<HTMLDivElement | null>(null);
  const categoryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (patientRef.current && !patientRef.current.contains(event.target as Node))
        setShowPatientDropdown(false);
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node))
        setShowCategoryDropdown(false);
      if (gpRef.current && !gpRef.current.contains(event.target as Node))
        setShowDoctorDropDown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      const res = await fetch("/api/patients");
      const json = await res.json();
      if (json.success) setPatients(json.patients);
    };
    const fetchCategories = async () => {
      const res = await fetch("/api/category");
      const json = await res.json();
      if (json.success) setCategories(json.categories);
    };
    const fetchDoctors = async () => {
      const res = await fetch("/api/doctors");
      const json = await res.json();
      if (json.success) setDoctors(json.doctors);
    };
    fetchPatients();
    fetchCategories();
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (data.patient_name) setSearchPatient(data.patient_name);
    if (data.category) setSearchCategory(data.category);
    if (data.doctors) setSearchDoctor(data.gp_doctor);
  }, [data.patient_name, data.category, data.gp_doctor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const filteredPatients = patients.filter((p) =>
    p.full_name.toLowerCase().includes(searchPatient.toLowerCase()),
  );
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchCategory.toLowerCase()),
  );
  const filteredGp = doctors.filter((g) =>
    g.doctor_name.toLowerCase().includes(searchDoctor.toLowerCase()),
  );

  const selectPatient = (p: any) => {
    setData({ ...data, patient_id: p.id, patient_name: p.full_name });
    setSearchPatient(p.full_name);
    setShowPatientDropdown(false);
  };
  const selectCategory = (c: any) => {
    setData({ ...data, category: c.name, category_id: c.id });
    setSearchCategory(c.name);
    setShowCategoryDropdown(false);
  };
  const selectDoctors = (d: any) => {
    setSearchDoctor(d.doctor_name);
    setData({ ...data, gp_doctor: d.doctor_name });
    setShowDoctorDropDown(false);
  };

  useEffect(() => {
    if (!showCategoryDropdown || !categoryRef.current) return;
    const rect = categoryRef.current.getBoundingClientRect();
    setCategoryDropdownUp(rect.bottom + 200 > window.innerHeight);
  }, [showCategoryDropdown]);

  const dropdownList =
    "absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto mt-1";
  const dropdownItem =
    "px-4 py-2.5 hover:bg-blue-50 hover:text-blue-700 cursor-pointer text-sm transition-colors";

  return (
    <div
      ref={containerRef}
      className="md:w-3/4 bg-white text-black p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5 max-h-screen overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-1 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Document Info</h2>
        <button
          type="button"
          onClick={onSave}
          disabled={!isExtracted}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all ${
            !isExtracted
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-cyan-400 hover:opacity-90 shadow-sm hover:shadow-md"
          }`}
        >
          {isEditMode ? "Update Document" : "Save & Submit"}
        </button>
      </div>

      {/* Patient */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Patient
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Prefix</label>
            <input
              type="text"
              name="prefix"
              placeholder="e.g. Mr, Mrs"
              value={data.prefix || ""}
              onChange={handleChange}
              disabled={!isExtracted}
              className={`${inputBase} ${!isExtracted ? inputDisabled : inputActive}`}
            />
          </div>

          <div ref={patientRef} className="relative">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Patient Name</label>
            <input
              type="text"
              value={searchPatient}
              onChange={(e) => {
                setSearchPatient(e.target.value);
                setShowPatientDropdown(true);
              }}
              onFocus={() => setShowPatientDropdown(true)}
              placeholder="Search patient..."
              disabled={!isExtracted}
              className={`${inputBase} ${!isExtracted ? inputDisabled : inputActive}`}
            />
            {showPatientDropdown && (
              <div className={dropdownList}>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((p) => (
                    <div key={p.id} onClick={() => selectPatient(p)} className={dropdownItem}>
                      {p.full_name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2.5 text-sm text-gray-400">No patients found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document details */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Document Details
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Date of Report</label>
            <input
              type="date"
              name="date_of_report"
              value={data.date_of_report || ""}
              onChange={handleChange}
              disabled={!isExtracted}
              className={`${inputBase} ${!isExtracted ? inputDisabled : inputActive}`}
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Document Subject</label>
            <input
              type="text"
              name="document_subject"
              value={data.document_subject || ""}
              onChange={handleChange}
              disabled={!isExtracted}
              placeholder="e.g. Blood Test Results"
              className={`${inputBase} ${!isExtracted ? inputDisabled : inputActive}`}
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Source Contact</label>
            <input
              type="text"
              name="source_contact"
              value={data.source_contact || ""}
              onChange={handleChange}
              disabled={!isExtracted}
              placeholder="Hospital or clinic name"
              className={`${inputBase} ${!isExtracted ? inputDisabled : inputActive}`}
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Store In</label>
            <select
              name="store_in"
              value={data.store_in || storeIn}
              onChange={(e) => {
                setStoreIn(e.target.value);
                setData({ ...data, store_in: e.target.value });
              }}
              disabled={!isExtracted}
              className={`${inputBase} ${!isExtracted ? inputDisabled : inputActive}`}
            >
              <option value="Correspondence">Correspondence</option>
              <option value="Investigations">Investigations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clinical */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Clinical
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div ref={gpRef}>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">GP Doctor</label>
            <div className="relative">
              <input
                type="text"
                name="gp_doctor"
                value={searchDoctor || data.gp_doctor || ""}
                onChange={(e) => {
                  setSearchDoctor(e.target.value);
                  setData({ ...data, gp_doctor: e.target.value });
                  setShowDoctorDropDown(true);
                }}
                disabled={!isExtracted}
                onFocus={() => setShowDoctorDropDown(true)}
                placeholder="Search GP doctor..."
                className={`${inputBase} ${!isExtracted ? inputDisabled : inputActive}`}
              />
              {showDoctorDropDown && isExtracted && (
                <div className={dropdownList}>
                  {filteredGp.length > 0 ? (
                    filteredGp.map((g, i) => (
                      <div key={i} onClick={() => selectDoctors(g)} className={dropdownItem}>
                        {g.doctor_name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2.5 text-sm text-gray-400">No GP doctor found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div ref={categoryRef}>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Category</label>
            <div className="relative">
              <input
                type="text"
                value={searchCategory}
                onChange={(e) => {
                  setSearchCategory(e.target.value);
                  setShowCategoryDropdown(true);
                }}
                onFocus={() => setShowCategoryDropdown(true)}
                placeholder="Search category..."
                disabled={!isExtracted}
                className={`${inputBase} ${!isExtracted ? inputDisabled : inputActive}`}
              />
              {showCategoryDropdown && (
                <div
                  className={`${dropdownList} ${categoryDropdownUp ? "bottom-full mb-1 mt-0" : ""}`}
                >
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((c) => (
                      <div key={c.id} onClick={() => selectCategory(c)} className={dropdownItem}>
                        {c.name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2.5 text-sm text-gray-400">No categories found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

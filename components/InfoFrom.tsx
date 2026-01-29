"use client";
import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";

interface InfoFormColumnProps {
  data: any;
  setData: Dispatch<SetStateAction<any>>;
  onSave: () => void;
  isExtracted: boolean;
  isEditMode: boolean;
}

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

  const gpRef = useRef<HTMLDivElement | null>(null);
  const patientRef = useRef<HTMLDivElement | null>(null);
  const categoryRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        patientRef.current &&
        !patientRef.current.contains(event.target as Node)
      ) {
        setShowPatientDropdown(false);
      }
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
      if (gpRef.current && !gpRef.current.contains(event.target as Node)) {
        setShowDoctorDropDown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch patients & categories
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

  // Sync search inputs
  useEffect(() => {
    if (data.patient_name) setSearchPatient(data.patient_name);
    if (data.category) setSearchCategory(data.category);
    if (data.doctors) setSearchDoctor(data.gp_doctor);
  }, [data.patient_name, data.category, data.gp_doctor]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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
    // setData({ ...data, doctor: d.doctor });
    // setSearchDoctor(d.doctor_name);
    // setShowDoctorDropDown(false);
    setSearchDoctor(d.doctor_name); // input box
    setData({ ...data, gp_doctor: d.doctor_name }); // main data
    setShowDoctorDropDown(false);
  };

  // Decide if category dropdown should go above
  useEffect(() => {
    if (!showCategoryDropdown || !categoryRef.current) return;
    const rect = categoryRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    setCategoryDropdownUp(rect.bottom + 200 > windowHeight); // 200px = dropdown height
  }, [showCategoryDropdown]);

  return (
    <div
      ref={containerRef}
      className="md:w-3/4 bg-white text-black p-6 rounded-2xl shadow-lg space-y-6 max-h-screen overflow-y-auto"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Document Info</h2>
        <button
          type="button"
          onClick={onSave}
          disabled={!isExtracted}
          className={`px-6 py-3 rounded-2xl text-white transition ${
            !isExtracted
              ? "bg-gray-400 cursor-not-allowed"
              : isEditMode
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isEditMode ? "Update Document" : "Save / Submit"}
        </button>
      </div>

      {/* Two-column grid for Prefix + Patient Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Prefix</label>
          <input
            type="text"
            name="prefix"
            placeholder="Prefix"
            value={data.prefix || ""}
            onChange={handleChange}
            disabled={!isExtracted}
            className={`border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-400 ${
              !isExtracted ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
        </div>

        <div ref={patientRef} className="relative">
          <label className="block mb-1 font-medium">Patient Name</label>
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
            className={`border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-400 ${
              !isExtracted ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
          {showPatientDropdown && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow max-h-48 overflow-y-auto mt-1">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => selectPatient(p)}
                    className="p-3 hover:bg-green-100 cursor-pointer rounded-xl"
                  >
                    {p.full_name}
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500">No patients found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Two-column grid for Date of Report + Document Subject */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Date of Report</label>
          <input
            type="date"
            name="date_of_report"
            value={data.date_of_report || ""}
            onChange={handleChange}
            disabled={!isExtracted}
            className={`border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-400 ${
              !isExtracted ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Document Subject</label>
          <input
            type="text"
            name="document_subject"
            value={data.document_subject || ""}
            onChange={handleChange}
            disabled={!isExtracted}
            className={`border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-400 ${
              !isExtracted ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
        </div>
      </div>

      {/* Source Contact + Store In */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Source Contact</label>
          <input
            type="text"
            name="source_contact"
            value={data.source_contact || ""}
            onChange={handleChange}
            disabled={!isExtracted}
            className={`border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-400 ${
              !isExtracted ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Store In</label>
          <select
            name="store_in"
            value={data.store_in || ""}
            onChange={handleChange}
            disabled={!isExtracted}
            className={`border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-400 ${
              !isExtracted ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          >
            <option value="Correspondence">Correspondence</option>
            <option value="Investigations">Investigations</option>
          </select>
        </div>
      </div>

      {/* GP Doctor + Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GP Doctor */}
        <div ref={gpRef}>
          <div className="relative w-full">
            <label className="block mb-1 font-medium">GP Doctor</label>
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
              placeholder="Search GP Doctor..."
              className={`w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors ${
                !isExtracted ? "bg-gray-100 cursor-not-allowed" : "bg-white"
              }`}
            />
            {showDoctorDropDown && isExtracted && (
              <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto mt-1 sm:text-sm">
                {filteredGp.length > 0 ? (
                  filteredGp.map((g, index) => (
                    <div
                      key={index}
                      onClick={() => selectDoctors(g)}
                      className="px-4 py-3 hover:bg-green-100 cursor-pointer transition-colors"
                    >
                      {g.doctor_name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-400">
                    No GP Doctor found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Category */}
        <div ref={categoryRef}>
          <div className="relative w-full">
            <label className="block mb-1 font-medium">Category</label>
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
              className={`border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-400 ${
                !isExtracted ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
            {showCategoryDropdown && (
              <div
                className={`absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow max-h-48 overflow-y-auto ${
                  categoryDropdownUp ? "bottom-full mb-1" : "mt-1"
                }`}
              >
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => selectCategory(c)}
                      className="p-3 hover:bg-green-100 cursor-pointer rounded-xl"
                    >
                      {c.name}
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-gray-500">No categories found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

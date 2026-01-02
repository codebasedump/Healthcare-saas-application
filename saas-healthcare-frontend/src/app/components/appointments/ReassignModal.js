// import React from 'react';

// const ReassignModal = ({
//   show,
//   selectedPatient,
//   selectedDoctor,
//   setSelectedDoctor,
//   doctorOptions = [],
//   onConfirm,
//   onClose,
//   currentDoctor
// }) => {
//   if (!show || !selectedPatient) return null;

//   const filteredDoctors = doctorOptions.filter(
//     (doc) => doc._id !== currentDoctor?._id
//   );

//   const handleDoctorChange = (e) => {
//     const selectedId = e.target.value;
//     const doc = filteredDoctors.find(d => d._id === selectedId);
//     setSelectedDoctor(doc || null);
//   };

//   return (
//     <div className="modal-backdrop modalbox">
//       <div className="modal-box animated-entry" onClick={(e) => e.stopPropagation()}>
//         <h2 className="modal-title">
//           🔄 Reassign Patient
//         </h2>

//         <div className="modal-body mt-5">
//           <div className="modal-row">
//             <strong>Patient:</strong> {selectedPatient.name || '—'}
//           </div>

//           <div className="modal-row">
//             <strong>Current Doctor:</strong>{' '}
//             {currentDoctor?.name
//               ? `${currentDoctor.name}${
//                   currentDoctor.specialty
//                     ? ` (${currentDoctor.specialty})`
//                     : ''
//                 }`
//               : '—'}
//           </div>

//           <div className="modal-row mt-4">
//             <strong>Select New Doctor:</strong>
//           </div>

//           <select
//             className="form-select mt-2"
//             value={selectedDoctor?._id || ''}
//             onChange={handleDoctorChange}
//           >
//             <option value="">— Select Doctor —</option>
//             {filteredDoctors.map((doc) => (
//               <option key={doc._id} value={doc._id}>
//                 {doc.name} {doc.specialty ? `(${doc.specialty})` : ''}
//               </option>
//             ))}
//           </select>

//           <div className="modal-row mt-4">
//             <strong>Audit Preview:</strong>
//           </div>
//           <div className="modal-row">
//             {selectedDoctor?.name
//               ? `Will reassign ${selectedPatient.name} to ${selectedDoctor.name}`
//               : '⚠️ No doctor selected'}
//           </div>
//         </div>

//         <div className="modal-footer mt-5">
//           <button className="btn btn-secondary" onClick={onClose}>
//             Cancel
//           </button>
//           <button
//             className="btn btn-primary"
//             onClick={onConfirm}
//             disabled={!selectedDoctor?._id}
//           >
//             Confirm Reassignment
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReassignModal;


import React from 'react';

const ReassignModal = ({
  show,
  selectedPatient,
  selectedDoctor,
  setSelectedDoctor,
  doctorOptions = [],
  onConfirm,
  onClose,
  currentDoctor
}) => {
  if (!show || !selectedPatient) return null;

  const filteredDoctors = doctorOptions.filter(
    (doc) => doc._id !== currentDoctor?._id
  );

  const handleDoctorChange = (e) => {
    const selectedId = e.target.value;
    const doc = filteredDoctors.find(d => d._id === selectedId);
    setSelectedDoctor(doc || null);
  };

  return (
    <div className="modal-backdrop modalbox">
      <div className="modal-box animated-entry" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">🔄 Reassign Patient</h2>

        <div className="modal-body mt-5">
          <div className="modal-row">
            <strong>Patient:</strong> {selectedPatient?.name || '—'}
          </div>

          <div className="modal-row">
            <strong>Current Doctor:</strong>{' '}
            {currentDoctor?.name
              ? `${currentDoctor.name}${currentDoctor.specialty ? ` (${currentDoctor.specialty})` : ''}`
              : '—'}
          </div>

          <div className="modal-row mt-4">
            <strong>Select New Doctor:</strong>
          </div>

          <select
            className="form-select mt-2"
            value={selectedDoctor?._id || ''}
            onChange={handleDoctorChange}
          >
            <option value="">— Select Doctor —</option>
            {filteredDoctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.name} {doc.specialty ? `(${doc.specialty})` : ''}
              </option>
            ))}
          </select>

          <div className="modal-row mt-4">
            <strong>Audit Preview:</strong>
          </div>
          <div className="modal-row">
            {selectedDoctor?.name
              ? `Will reassign ${selectedPatient.name} to ${selectedDoctor.name}`
              : '⚠️ No doctor selected'}
          </div>
        </div>

        <div className="modal-footer mt-5">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={!selectedDoctor?._id}
          >
            Confirm Reassignment
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReassignModal;
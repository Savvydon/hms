import { useCallback, useState } from "react";
import { FaCalendarPlus } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import PageHeader from "../../components/common/PageHeader";
import LoadingState from "../../components/common/LoadingState";
import ErrorAlert from "../../components/common/ErrorAlert";
import FormModal from "../../components/common/FormModal";
import AppointmentTable from "../../components/appointments/AppointmentTable";
import AppointmentForm from "../../components/appointments/AppointmentForm";
import useAppointments from "../../hooks/useAppointments";
import usePatients from "../../hooks/usePatients";
import useCollection from "../../hooks/useCollection";
import { getDoctors } from "../../api/doctorApi";
import { getApiError } from "../../utils/errors";

const empty = {
  patient_id: "",
  doctor_id: "",
  appointment_date: "",
  appointment_time: "",
  reason: "",
};

export default function AppointmentPage() {
  const { hasRole } = useAuth();
  const ap = useAppointments();
  const patients = usePatients();
  const doctorLoader = useCallback(() => getDoctors(), []);
  const doctors = useCollection(doctorLoader);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(empty);
  const [submitError, setSubmitError] = useState("");

  const canCreateAppointment = hasRole("admin") || hasRole("receptionist");

  const change = (e) => {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    try {
      await ap.create({
        ...form,
        patient_id: Number(form.patient_id),
        doctor_id: Number(form.doctor_id),
        appointment_time: `${form.appointment_time}:00`,
      });
      setForm(empty);
      setShow(false);
    } catch (err) {
      setSubmitError(getApiError(err));
    }
  };

  if (ap.loading || patients.loading || doctors.loading) {
    return <LoadingState />;
  }

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Manage patient bookings and appointment schedules."
        actionLabel={canCreateAppointment ? "New Appointment" : undefined}
        onAction={canCreateAppointment ? () => setShow(true) : undefined}
      />

      <ErrorAlert error={ap.error || patients.error || doctors.error} />

      <AppointmentTable appointments={ap.items} />

      {canCreateAppointment && (
        <FormModal
          show={show}
          onHide={() => setShow(false)}
          title={
            <>
              <FaCalendarPlus className="me-2" />
              Create Appointment
            </>
          }
          onSubmit={submit}
          submitLabel="Book Appointment"
        >
          <ErrorAlert error={submitError} />
          <AppointmentForm
            patients={patients.items}
            doctors={doctors.items}
            value={form}
            onChange={change}
          />
        </FormModal>
      )}
    </>
  );
}

import EventRegistrationForm from '../EventRegistrationForm';

export default function EventRegistrationFormExample() {
  return (
    <div className="p-8">
      <EventRegistrationForm
        onSubmit={(data) => console.log('Submitted:', data)}
        onBack={() => console.log('Back clicked')}
      />
    </div>
  );
}

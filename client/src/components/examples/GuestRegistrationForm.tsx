import GuestRegistrationForm from '../GuestRegistrationForm';

export default function GuestRegistrationFormExample() {
  return (
    <div className="p-8">
      <GuestRegistrationForm
        onSubmit={(data) => console.log('Submitted:', data)}
        onBack={() => console.log('Back clicked')}
      />
    </div>
  );
}

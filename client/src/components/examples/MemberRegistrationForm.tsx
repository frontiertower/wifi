import MemberRegistrationForm from '../MemberRegistrationForm';

export default function MemberRegistrationFormExample() {
  return (
    <div className="p-8">
      <MemberRegistrationForm
        onSubmit={(data) => console.log('Submitted:', data)}
        onBack={() => console.log('Back clicked')}
      />
    </div>
  );
}

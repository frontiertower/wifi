import logoImage from '@assets/generated_images/Frontier_Tower_WiFi_logo_bc6f89e2.png';

export default function Header() {
  return (
    <header className="w-full border-b bg-card" data-testid="header-main">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="Frontier Tower" className="h-10 w-10" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">Frontier Tower</h1>
            <p className="text-xs text-muted-foreground">WiFi Portal</p>
          </div>
        </div>
      </div>
    </header>
  );
}

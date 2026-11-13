type SiteFooterProps = {
  tone?: 'light' | 'dark' | 'kitchen';
  className?: string;
};

export function SiteFooter({ tone = 'light', className = '' }: SiteFooterProps) {
  return (
    <footer className={`sf-site-footer sf-site-footer--${tone} ${className}`.trim()}>
      <p>Holanda Desenvolvimento de Software ME · CNPJ 50.509.731/0001-35</p>
      <p>Copyright © Holanda Dev Software 2026. Todos os direitos reservados.</p>
    </footer>
  );
}

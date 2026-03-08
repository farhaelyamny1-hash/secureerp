const PlaceholderPage = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <p className="text-muted-foreground font-heading">قريباً — هذه الصفحة قيد التطوير</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;

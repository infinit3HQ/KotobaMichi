// src/components/organisms/footer.tsx
export function Footer() {
  return (
    <footer className="border-t py-6 text-sm text-muted-foreground">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <p>© {new Date().getFullYear()} KotobaMichi</p>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">
            Privacy
          </a>
          <a href="#" className="hover:underline">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}

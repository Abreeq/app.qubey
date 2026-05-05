import AuthNavbar from "../components/AuthNavbar";

export default function PublicLayout({ children }) {
  return (
    <>
      <AuthNavbar/>
      {children}
    </>
  );
}
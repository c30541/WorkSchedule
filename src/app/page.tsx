import Link from "next/link";

export default function Home() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <h1 className="display-3 fw-bold mb-5">班表系統</h1>
        <div className="d-flex gap-3 justify-content-center">
          <Link href="/schedule" className="btn btn-primary btn-lg shadow">
            <i className="bi bi-calendar3 me-2"></i>
            班表管理
          </Link>
          <Link href="/employees" className="btn btn-success btn-lg shadow">
            <i className="bi bi-people me-2"></i>
            員工管理
          </Link>
        </div>
      </div>
    </div>
  );
}

import { google } from "googleapis"; // Mengimpor library googleapis untuk berinteraksi dengan Google APIs

// Mengatur autentikasi JWT (JSON Web Token) untuk akun layanan Google.
// Kredensial diambil dari variabel lingkungan.
const auth = new google.auth.JWT({
  email: import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, // Email akun layanan
  key: import.meta.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Kunci privat, mengganti karakter newline yang di-escape
  scopes: ["https://www.googleapis.com/auth/drive.readonly"], // Scope akses: hanya membaca Google Drive
});

// Menginisialisasi objek Google Drive API dengan versi v3 dan autentikasi yang sudah diatur.
const drive = google.drive({ version: "v3", auth });

const ROOT_ID = import.meta.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

export async function getFolders(parentId: string) {
  const res = await drive.files.list({
    // Query untuk mencari folder: 'parentId' adalah induk, mimeType adalah folder, dan tidak dihapus.
    q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)", // Hanya mengambil ID dan nama file/folder.
    orderBy: "name desc", // Mengurutkan hasil berdasarkan nama secara menurun.
  });
  return res.data.files || []; // Mengembalikan daftar folder atau array kosong jika tidak ada.
}

/**
 * Mengambil daftar file media di dalam folder tertentu dari Google Drive.
 * Mendukung paginasi dan pembatasan jumlah file.
 * @param folderId ID folder tempat file media berada.
 * @param pageToken Token untuk mengambil halaman hasil berikutnya (opsional).
 * @param limit Batas jumlah file yang akan diambil per halaman (default 10).
 * @returns Objek yang berisi array file media dan token halaman berikutnya.
 */
export async function getMediaFiles(
  folderId: string,
  pageToken?: string | null,
  limit: number = 10, // Nilai default limit adalah 10.
) {
  try {
    const response = await drive.files.list({
      // Query untuk mencari file: 'folderId' adalah induk, dan tidak dihapus.
      q: `'${folderId}' in parents and trashed = false`,
      // Mengambil next page token, id, name, mimeType, dan webContentLink dari file.
      fields: "nextPageToken, files(id, name, mimeType, webContentLink)",
      pageSize: limit, // Menggunakan parameter limit untuk menentukan jumlah hasil per halaman.
      pageToken: pageToken || undefined, // Menggunakan pageToken jika disediakan.
    });

    return {
      files: response.data.files || [], // Mengembalikan daftar file atau array kosong.
      nextPageToken: response.data.nextPageToken || null, // Mengembalikan token halaman berikutnya atau null.
    };
  } catch (error) {
    console.error("Error fetching media files:", error); // Mencatat error ke konsol
    throw error; // Melemparkan error untuk penanganan lebih lanjut.
  }
}

export async function getArchiveNavigation(
  yearId?: string,
  monthId?: string,
  activityId?: string,
) {
  try {
    let data = [];
    let view = "years";
    let baseUrl = "?yearId=";

    if (activityId) {
      view = "files";
      // Data file akan dihandle oleh getMediaFiles secara terpisah
      return { data: [], view, baseUrl: "" };
    }

    if (monthId) {
      data = await getFolders(monthId);
      view = "activities";
      baseUrl = `?yearId=${yearId}&monthId=${monthId}&activityId=`;
    } else if (yearId) {
      data = await getFolders(yearId);
      view = "months";
      baseUrl = `?yearId=${yearId}&monthId=`;
    } else {
      data = await getFolders(ROOT_ID);
      view = "years";
      baseUrl = "?yearId=";
    }

    return { data, view, baseUrl };
  } catch (error) {
    console.error("Fungsi getArchiveNavigation Error:", error);
    throw new Error("Gagal mengambil struktur arsip.");
  }
}

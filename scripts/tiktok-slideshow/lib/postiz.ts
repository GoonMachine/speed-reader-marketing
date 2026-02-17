const BASE_URL = "https://api.postiz.com/public/v1";
const TIKTOK_INTEGRATION_ID = "cmlkd6kg802kvol0ylh09yuxn";

function getKey(): string {
  const key = process.env.POSTIZ_API_KEY;
  if (!key) throw new Error("POSTIZ_API_KEY required in env");
  return key;
}

interface UploadResult {
  id: string;
  name: string;
  path: string;
}

export async function uploadImage(
  imageBuffer: Buffer,
  filename: string
): Promise<UploadResult> {
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: "image/png" });
  formData.append("file", blob, filename);

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    headers: { Authorization: getKey() },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function createTikTokDraft(
  caption: string,
  images: UploadResult[]
): Promise<any> {
  const body = {
    type: "draft",
    date: new Date().toISOString(),
    shortLink: false,
    tags: [],
    posts: [
      {
        integration: { id: TIKTOK_INTEGRATION_ID },
        value: [
          {
            content: caption,
            image: images.map((img) => ({
              id: img.id,
              path: img.path,
            })),
          },
        ],
        settings: {
          __type: "tiktok",
          privacy_level: "SELF_ONLY",
          duet: true,
          stitch: true,
          comment: true,
          autoAddMusic: "no",
          brand_content_toggle: false,
          brand_organic_toggle: false,
          content_posting_method: "DIRECT_POST",
        },
      },
    ],
  };

  const res = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: {
      Authorization: getKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Post failed (${res.status}): ${text}`);
  }

  return res.json();
}

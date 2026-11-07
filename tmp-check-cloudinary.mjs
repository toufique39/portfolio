const urls = {
  flAttachment: "https://res.cloudinary.com/nvyeoofj/raw/upload/fl_attachment:Toufique-Ahmed-Resume.pdf/v1794075561/toufique-portfolio/resumes/resume-484bfaa0-879c-418b-825e-593bb5981515.pdf",
  doubleExt: "https://res.cloudinary.com/nvyeoofj/image/upload/v1794075562/toufique-portfolio/profile/profile-image-aeb6d7c9-bfb6-4eb9-bb33-5908adcfd1dc.png.png",
};
for (const [name, url] of Object.entries(urls)) {
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  console.log(name, res.status, "bytes:", buf.length, "type:", res.headers.get("content-type"), "disposition:", res.headers.get("content-disposition"));
}

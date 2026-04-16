const API = "http://localhost:5000/api/roulette";

export const getRoulette = async () => {
  const res = await fetch(API);
  return res.json();
};

export const saveRoulette = async (items: any[]) => {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });

  return res.json();
};
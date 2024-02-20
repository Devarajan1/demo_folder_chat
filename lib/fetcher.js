export const fetcher = (url) => fetch(url).then((res) => res.json());

class FetchError extends Error {
  constructor(message, status, info) {
    super(message);
    this.status = status;
    this.info = info;
  }
}

export const errorHandlingFetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new FetchError(
      "An error occurred while fetching the data.",
      res.status,
      await res.json()
    );
    throw error;
  }
  return res.json();
};

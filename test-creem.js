const apiKey = "creem_test_3owWakfqubfjmDtD2Pnowg";
const productId = "prod_3Ok6QOuqs5xiTvH0bohraS";

async function test() {
  const payload = { product_id: productId, success_url: "https://probrew.com.tr" };
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'User-Agent': 'ProBrew/1.0',
    'X-Requested-With': 'XMLHttpRequest'
  };
  
  const res = await fetch("https://test-api.creem.io/v1/checkouts", {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  
  console.log(res.status, await res.text());
}
test();

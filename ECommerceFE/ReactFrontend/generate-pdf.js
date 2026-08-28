import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Initialize PDF Builder
const doc = new PDFDocument({ margin: 50, bufferPages: true });
const outputPath = path.join(process.cwd(), 'ECommerceFE_Integration_Guide.pdf');
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Color Palette
const colors = {
  emerald: '#0f766e',
  slate: '#334155',
  lightGray: '#f8fafc',
  darkGray: '#1e293b',
  border: '#e2e8f0',
  text: '#334155',
  codeText: '#0f172a'
};

// Help helper for text wrapping
const writeText = (text, size = 10.5, font = 'Helvetica', color = colors.text, spacing = 0.5) => {
  doc.font(font)
     .fontSize(size)
     .fillColor(color);
  doc.text(text, { width: 512, align: 'justify' });
  doc.moveDown(spacing);
};

// Title drawing
const writeHeader = (title, subtitle = null) => {
  if (doc.y + 70 > doc.page.height - 50) doc.addPage();
  doc.font('Helvetica-Bold')
     .fontSize(15)
     .fillColor(colors.emerald);
  doc.text(title, { underline: true });
  doc.moveDown(0.3);
  if (subtitle) {
    doc.font('Helvetica-Oblique')
       .fontSize(10)
       .fillColor(colors.slate);
    doc.text(subtitle);
    doc.moveDown(0.5);
  }
};

// Custom Code block builder
const drawCodeBlock = (code) => {
  doc.font('Courier').fontSize(8.5);
  
  // Calculate heights
  const blockW = 512;
  const padding = 8;
  const textW = blockW - padding * 2;
  const blockHeight = doc.heightOfString(code, { width: textW }) + padding * 2;

  // Add Page if it starts below threshold
  if (doc.y + blockHeight + 15 > doc.page.height - 50) {
    doc.addPage();
  }

  const startY = doc.y;

  // Draw background box
  doc.rect(50, startY, blockW, blockHeight)
     .fillColor(colors.lightGray)
     .fill();

  // Draw border outline
  doc.rect(50, startY, blockW, blockHeight)
     .lineWidth(0.5)
     .strokeColor(colors.border)
     .stroke();

  // Draw code text
  doc.fillColor(colors.codeText)
     .font('Courier-Bold')
     .text(code, 50 + padding, startY + padding, { width: textW });

  doc.y = startY + blockHeight;
  doc.moveDown(0.8);
};

// ----------------------------------------------------
// Page 1: COVER PAGE
// ----------------------------------------------------
doc.rect(50, 50, 512, 692)
   .lineWidth(2)
   .strokeColor(colors.emerald)
   .stroke();

doc.moveDown(6);
doc.font('Helvetica-Bold').fontSize(26).fillColor(colors.emerald).text('E-COMMERCE INTEGRATION', { align: 'center' });
doc.font('Helvetica-Bold').fontSize(20).fillColor(colors.slate).text('React Frontend -> Express Backend', { align: 'center' });
doc.moveDown(1.5);
doc.font('Helvetica').fontSize(12).fillColor(colors.text).text('A step-by-step developer blueprint outlining endpoints, credentials, local states, and client action gists for production deployment.', { align: 'center', width: 400 });

doc.moveDown(8);
doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.emerald).text('Target Audience:', { align: 'center' });
doc.font('Helvetica').fontSize(10.5).fillColor(colors.text).text('Frontend Engineers, Full-Stack Architects & QA Teams', { align: 'center' });
doc.moveDown(1.5);
doc.font('Helvetica').fontSize(9).fillColor(colors.text).text('Generated: August 2026', { align: 'center' });

doc.addPage();

// ----------------------------------------------------
// Page 2: TABLE OF CONTENTS & SETUP
// ----------------------------------------------------
writeHeader('Table of Contents', 'Guide Outline & Navigation');
writeText('1. Setup & Environment Configurations............................................................................... Page 2');
writeText('2. Authentication & Session Services................................................................................... Page 3');
writeText('3. Catalog Filtering & Detailed Views.................................................................................. Page 4');
writeText('4. Shopping Cart API Mappings............................................................................................. Page 5');
writeText('5. Checkout Orders & Idempotency Rules............................................................................. Page 6');
writeText('6. Razorpay Payment Integrations......................................................................................... Page 7');
writeText('7. Administrative Panel Operations...................................................................................... Page 8');
doc.moveDown(1.5);

writeHeader('1. Setup & Environment Configurations', 'Bootstrap environment vars and Axios');
writeText('Introduce dynamic configurations to prevent endpoints from leaking into visual layouts.');

writeText('Step 1.1: Local Environment Variable Setup');
writeText('Define values in your local browser-runtime environment context (.env) at the root level:');
drawCodeBlock(`VITE_API_URL=https://api.yourdomain.com/api/v1\nVITE_RAZORPAY_KEY_ID=rzp_test_productionKeys`);

writeText('Step 1.2: Centralized Axios Instance Service');
writeText('Create src/lib/api.js to structure credentials forwarding. This tracks access cookies securely cross-origin:');
drawCodeBlock(`import axios from 'axios';\n\nexport const api = axios.create({\n  baseURL: import.meta.env.VITE_API_URL,\n  withCredentials: true, // Crucial for cross-origin cookie-session headers\n});`);

doc.addPage();

// ----------------------------------------------------
// Page 3: AUTHENTICATION
// ----------------------------------------------------
writeHeader('2. Authentication & Session Services', 'Establishing user context & token lifetimes');
writeText('Link login operations to REST endpoints. Keep users logged in by checking active credentials.');

writeText('Step 2.1: App Provider Verification Check');
writeText('On application startup in AppProvider.jsx, attempt a silent token checks using a background verify query:');
drawCodeBlock(`const checkActiveSession = async () => {\n  try {\n    const response = await api.get('/auth/me');\n    setSession(response.data.user);\n  } catch {\n    signOut(); // Handle expired context gracefully\n  }\n};`);

writeText('Step 2.2: Sign In Action mapping');
writeText('Map login inputs in LoginPage.jsx to auth POST. On success, store the JWT in memory or localStorage:');
drawCodeBlock(`const handleLogin = async (e) => {\n  e.preventDefault();\n  try {\n    const res = await api.post('/auth/login', { email, password });\n    login(res.data.user, res.data.accessToken);\n    navigate('/admin');\n  } catch (err) {\n    toast.error("Invalid credentials.");\n  }\n};`);

writeText('Step 2.3: Password Recovery Link Requests');
writeText('In ForgotPasswordPage.jsx, POST the email to recovery routes:');
drawCodeBlock(`const handleForgotPassword = async (email) => {\n  await api.post('/auth/forgot-password', { email });\n  toast.success("Recovery instructions sent via email!");\n};`);

doc.addPage();

// ----------------------------------------------------
// Page 4: PRODUCT CATALOG
// ----------------------------------------------------
writeHeader('3. Catalog Filtering & Detailed Views', 'Loading browse listings dynamically');
writeText('Transition catalogue routes using query criteria to allow users to paginate, search, and category filter.');

writeText('Step 3.1: Fetch List with Sorting Headers');
writeText('Embed parameters inside ProductsPage.jsx using active sorting options:');
drawCodeBlock(`const loadProducts = async () => {\n  const params = {\n    q: searchKeyword || undefined,\n    category: activeCategory === 'All' ? undefined : activeCategory,\n    sort: activeSort === 'Price low' ? 'price' : '-price'\n  };\n  const res = await api.get('/products', { params });\n  setProductsList(res.data.data);\n};`);

writeText('Step 3.2: Detailed Specs Map & Image Arrays');
writeText('In ProductDetailPage.jsx, search products using slugs instead of raw Mongo IDs:');
drawCodeBlock(`const fetchProductDetails = async () => {\n  const res = await api.get(\`/products/\${slug}\`);\n  setProduct(res.data.data.product);\n};`);

writeText('Design Detail: Image Render Guard');
writeText('The database stores catalog pictures under an array of objects. Guard elements to load safely:');
drawCodeBlock(`const imgUrl = product.images?.[0]?.url || product.images?.[0] || 'placeholder.png';`);

doc.addPage();

// ----------------------------------------------------
// Page 5: CART OPERATIONS
// ----------------------------------------------------
writeHeader('4. Shopping Cart API Mappings', 'Synchronizing offline items with database state');
writeText('When logged out, store cart changes in local client state. Once authenticated, merge and push cart details to backing databases.');

writeText('Step 4.1: Merge Local Cart Items on Login Session');
writeText('Map localized carts inside AppProvider.jsx during user validation steps:');
drawCodeBlock(`const mergeLocalCart = async (guestItems) => {\n  for (const item of guestItems) {\n    await api.post('/cart/items', {\n      productId: item.product.id || item.product._id,\n      quantity: item.quantity\n    });\n  }\n  localStorage.removeItem('guestCart');\n};`);

writeText('Step 4.2: Update and Remove Cart Services');
writeText('Construct cart item mutations on CartPage.jsx to verify available inventory:');
drawCodeBlock(`const modifyQuantity = async (productId, nextQty) => {\n  await api.patch(\`/cart/items/\${productId}\`, { quantity: nextQty });\n  refreshCart(); // Pull DB update\n};\n\nconst removeItem = async (productId) => {\n  await api.delete(\`/cart/items/\${productId}\`);\n  refreshCart();\n};`);

doc.addPage();

// ----------------------------------------------------
// Page 6: CHECKOUT & IDEMPOTENCY
// ----------------------------------------------------
writeHeader('5. Checkout Orders & Idempotency Rules', 'Safe transactions via client-side keys');
writeText('Prevent duplicate transactions or order creations caused by double-taps on weak networks.');

writeText('Step 5.1: Idempotency Key Injection Header');
writeText('Inside CheckoutPage.jsx, generate and assign a unique uuid parameter. Embed it inside custom request headers:');
drawCodeBlock(`import { v4 as uuidv4 } from 'uuid';\n\nconst submitOrder = async (shippingDetails) => {\n  const key = uuidv4();\n  const res = await api.post('/checkout', { shippingDetails }, {\n    headers: {\n      'Idempotency-Key': key // Prevents duplicate checkouts on the backend\n    }\n  });\n  return res.data.data.order;\n};`);

writeText('Step 5.2: Cart Recovery Guard');
writeText('Ensure that when an order registers successfully, you clear out cart buffers to ensure the checkout elements reset properly:');
drawCodeBlock(`if (response.status === 201) {\n  setCartItems([]);\n  navigate(\`/orders/\${response.data.order.orderNumber}\`);\n}`);

doc.addPage();

// ----------------------------------------------------
// Page 7: RAZORPAY
// ----------------------------------------------------
writeHeader('6. Razorpay Payment Integrations', 'Initializing active payment checkout');
writeText('Allow shoppers to process payments from the Order Details page for pending orders.');

writeText('Step 6.1: Load Web payment script hooks');
writeText('Create a script loader in OrderDetailPage.jsx:');
drawCodeBlock(`const loadRazorpay = () => new Promise((resolve) => {\n  const script = document.createElement('script');\n  script.src = 'https://checkout.razorpay.com/v1/checkout.js';\n  script.onload = () => resolve(true);\n  script.onerror = () => resolve(false);\n  document.body.appendChild(script);\n});`);

writeText('Step 6.2: Launch Payment Options Window');
writeText('Submit orders back-end to launch option frames:');
drawCodeBlock(`const triggerPayment = async () => {\n  const initialized = await loadRazorpay();\n  if (!initialized) return toast.error("SDK load failed");\n\n  const res = await api.post(\`/payments/\${orderNumber}\`);\n  const { razorpayOrder } = res.data.data;\n\n  const options = {\n    key: import.meta.env.VITE_RAZORPAY_KEY_ID,\n    amount: razorpayOrder.amount,\n    currency: razorpayOrder.currency,\n    order_id: razorpayOrder.id,\n    handler: (response) => {\n      toast.success("Payment submitted!");\n      refreshOrderDetails();\n    }\n  };\n  new window.Razorpay(options).open();\n};`);

doc.addPage();

// ----------------------------------------------------
// Page 8: ADMIN OPERATIONS
// ----------------------------------------------------
writeHeader('7. Administrative Panel Operations', 'Backend retail operations & status overrides');
writeText('Map admin tools to endpoints. Restrict access through auth gate controls.');

writeText('Step 7.1: Catalog Product CRUD');
writeText('Create, edit, or deactivate catalog items on AdminProductEditorPage.jsx:');
drawCodeBlock(`// Create New Item\nawait api.post('/products', payload);\n\n// Update Existing Item\nawait api.patch(\`/products/\${slug}\`, payload);`);

writeText('Step 7.2: Inventory Stock Adjustments');
writeText('Adjust stock levels on AdminInventoryPage.jsx using PATCH:');
drawCodeBlock(`const adjustStock = async (productId, deltaCount) => {\n  await api.patch(\`/admin/products/\${productId}/stock\`, {\n    delta: Number(deltaCount) // Increments or decrements stock count\n  });\n};`);

writeText('Step 7.3: Order Fulfillment Status Shifts');
writeText('Fulfill order status states in AdminOrdersPage.jsx:');
drawCodeBlock(`const updateStatus = async (orderId, newStatus) => {\n  await api.patch(\`/admin/orders/\${orderId}/status\`, {\n    status: newStatus // processing, shipped, delivered, etc.\n  });\n};`);

// ----------------------------------------------------
// Footers and Page Numbers Compilation
// ----------------------------------------------------
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  
  // Header text for each page (except Cover Page)
  if (i > range.start) {
    doc.font('Helvetica-Bold')
       .fontSize(8.5)
       .fillColor(colors.emerald)
       .text('E-Commerce Frontend Integration Blueprint', 50, 30);
    doc.moveTo(50, 42)
       .lineTo(562, 42)
       .lineWidth(0.5)
       .strokeColor(colors.border)
       .stroke();
  }

  // Footer text
  doc.moveTo(50, 750)
     .lineTo(562, 750)
     .lineWidth(0.5)
     .strokeColor(colors.border)
     .stroke();
  doc.font('Helvetica')
     .fontSize(8.5)
     .fillColor(colors.slate)
     .text(`Page ${i + 1} of ${range.count}`, 50, 758, { align: 'right', width: 512 });
}

// End & Output File
doc.end();
console.log('PDF Integration Guide successfully created!');

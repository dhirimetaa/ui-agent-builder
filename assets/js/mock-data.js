const MOCK = {
  org: {
    name: 'Northwind Apps',
    user: { name: 'Alex Rivera', initials: 'AR', role: 'Product Admin', email: 'alex@northwind.app' }
  },
  notifications: [
    { id: 1, title: 'Stock below threshold', body: 'SKU-1042 Wireless Headset has 6 units left.', time: '12m ago', unread: true },
    { id: 2, title: 'Invoice approved', body: 'INV-2081 for Contoso was marked paid.', time: '1h ago', unread: true },
    { id: 3, title: 'New hire packet', body: 'Jordan Lee completed onboarding documents.', time: 'Yesterday', unread: false }
  ],
  dashboard: {
    metrics: [
      { label: 'Open orders', value: '128', delta: '+12%', icon: 'fa-bag-shopping' },
      { label: 'Inventory SKUs', value: '1,482', delta: '+3%', icon: 'fa-boxes-stacked' },
      { label: 'Receivables', value: '$84.2k', delta: '-4%', icon: 'fa-file-invoice-dollar' },
      { label: 'Headcount', value: '46', delta: '+1', icon: 'fa-user-group' }
    ],
    activity: [
      { title: 'Draft item saved', detail: 'Trail Bottle 750ml', time: '8m ago' },
      { title: 'PO received', detail: 'PO-4419 · 240 units', time: '34m ago' },
      { title: 'Payroll preview', detail: 'October cycle ready for review', time: '2h ago' },
      { title: 'Vendor bill', detail: 'Harbor Freight · $1,240', time: '5h ago' }
    ]
  },
  inventory: [
    { sku: 'SKU-1042', name: 'Wireless Headset', category: 'Electronics', price: 89, status: 'Active', updated: '2026-10-08' },
    { sku: 'SKU-1108', name: 'Trail Bottle 750ml', category: 'Outdoors', price: 24, status: 'Draft', updated: '2026-10-11' },
    { sku: 'SKU-0981', name: 'Desk Lamp', category: 'Home', price: 42, status: 'Active', updated: '2026-09-28' },
    { sku: 'SKU-2210', name: 'Linen Notebook', category: 'Office', price: 12, status: 'Archived', updated: '2026-08-14' },
    { sku: 'SKU-3344', name: 'USB-C Hub', category: 'Electronics', price: 54, status: 'Active', updated: '2026-10-02' },
    { sku: 'SKU-1180', name: 'Ceramic Mug', category: 'Home', price: 16, status: 'Draft', updated: '2026-10-10' },
    { sku: 'SKU-0772', name: 'Field Jacket', category: 'Apparel', price: 140, status: 'Active', updated: '2026-09-19' },
    { sku: 'SKU-4501', name: 'Standing Mat', category: 'Office', price: 38, status: 'Archived', updated: '2026-07-30' },
    { sku: 'SKU-1299', name: 'Packing Tape', category: 'Supplies', price: 7, status: 'Active', updated: '2026-10-06' },
    { sku: 'SKU-5602', name: 'Monitor Arm', category: 'Office', price: 96, status: 'Draft', updated: '2026-10-12' }
  ],
  finance: [
    { id: 'INV-2081', customer: 'Contoso', amount: 4200, status: 'Paid', due: '2026-10-01' },
    { id: 'INV-2088', customer: 'Fabrikam', amount: 1860, status: 'Open', due: '2026-10-18' },
    { id: 'INV-2094', customer: 'Adventure Works', amount: 970, status: 'Draft', due: '2026-10-24' },
    { id: 'INV-2072', customer: 'Wide World Importers', amount: 6400, status: 'Overdue', due: '2026-09-22' }
  ],
  hr: [
    { name: 'Jordan Lee', team: 'Design', role: 'Product Designer', status: 'Active' },
    { name: 'Sam Okonkwo', team: 'Engineering', role: 'Frontend', status: 'Active' },
    { name: 'Priya Shah', team: 'Finance', role: 'Controller', status: 'Active' },
    { name: 'Chris Nguyen', team: 'People', role: 'Recruiter', status: 'Leave' }
  ]
};

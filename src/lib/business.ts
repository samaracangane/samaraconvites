// Dados oficiais do vendedor.
export const BUSINESS = {
  brand: "Samara Encanto Convites",
  legalName: "Samara Roberta Cangane",
  taxId: "419.358.788-67",
  taxIdLabel: "CPF",
  city: "Monte Aprazível",
  state: "SP",
  country: "Brasil",
  email: "srcangane@gmail.com",
  whatsappNumber: "17996722089",
  whatsappDisplay: "(17) 99672-2089",
  whatsappUrl: "https://wa.me/5517996722089",
  instagramHandle: "@samaraencantoconvites",
  instagramUrl: "https://instagram.com/samaraencantoconvites",
  supportHours: "Segunda a sexta, das 9h às 18h (horário de Brasília)",
  deliveryTime: "até 24 horas úteis após a confirmação do pagamento",
} as const;

export const BUSINESS_ADDRESS = `${BUSINESS.city} — ${BUSINESS.state}, ${BUSINESS.country}`;
export const BUSINESS_IDENTIFICATION = `${BUSINESS.legalName} (${BUSINESS.taxIdLabel} ${BUSINESS.taxId}) — ${BUSINESS_ADDRESS}`;

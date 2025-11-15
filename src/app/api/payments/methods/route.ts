import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

// Métodos de pago disponibles en Argentina
const paymentMethods = {
  credit_card: [
    {
      id: "visa",
      name: "Visa",
      payment_type_id: "credit_card",
      thumbnail:
        "https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg",
      secure_thumbnail:
        "https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg",
      processing_modes: ["aggregator"],
      additional_info_needed: [
        "cardholder_name",
        "cardholder_identification_number",
      ],
      min_allowed_amount: 1,
      max_allowed_amount: 25000000,
      accreditation_time: 2880,
      financial_institutions: [],
      settings: [],
    },
    {
      id: "master",
      name: "Mastercard",
      payment_type_id: "credit_card",
      thumbnail:
        "https://http2.mlstatic.com/storage/logos-api-admin/aa2b8f70-5c85-11ec-ae75-df2bef173be2-m.svg",
      secure_thumbnail:
        "https://http2.mlstatic.com/storage/logos-api-admin/aa2b8f70-5c85-11ec-ae75-df2bef173be2-m.svg",
      processing_modes: ["aggregator"],
      additional_info_needed: [
        "cardholder_name",
        "cardholder_identification_number",
      ],
      min_allowed_amount: 1,
      max_allowed_amount: 25000000,
      accreditation_time: 2880,
      financial_institutions: [],
      settings: [],
    },
    {
      id: "amex",
      name: "American Express",
      payment_type_id: "credit_card",
      thumbnail:
        "https://http2.mlstatic.com/storage/logos-api-admin/ce454480-445f-11eb-bf78-3b1ee7bf744c-m.svg",
      secure_thumbnail:
        "https://http2.mlstatic.com/storage/logos-api-admin/ce454480-445f-11eb-bf78-3b1ee7bf744c-m.svg",
      processing_modes: ["aggregator"],
      additional_info_needed: [
        "cardholder_name",
        "cardholder_identification_number",
      ],
      min_allowed_amount: 1,
      max_allowed_amount: 25000000,
      accreditation_time: 2880,
      financial_institutions: [],
      settings: [],
    },
  ],
  debit_card: [
    {
      id: "debvisa",
      name: "Visa Débito",
      payment_type_id: "debit_card",
      thumbnail:
        "https://http2.mlstatic.com/storage/logos-api-admin/312238e0-571b-11ec-ae75-df2bef173be2-m.svg",
      secure_thumbnail:
        "https://http2.mlstatic.com/storage/logos-api-admin/312238e0-571b-11ec-ae75-df2bef173be2-m.svg",
      processing_modes: ["aggregator"],
      additional_info_needed: [
        "cardholder_name",
        "cardholder_identification_number",
      ],
      min_allowed_amount: 1,
      max_allowed_amount: 25000000,
      accreditation_time: 0,
      financial_institutions: [],
      settings: [],
    },
    {
      id: "debmaster",
      name: "Mastercard Débito",
      payment_type_id: "debit_card",
      thumbnail:
        "https://http2.mlstatic.com/storage/logos-api-admin/ce454480-445f-11eb-bf78-3b1ee7bf744c-m.svg",
      secure_thumbnail:
        "https://http2.mlstatic.com/storage/logos-api-admin/ce454480-445f-11eb-bf78-3b1ee7bf744c-m.svg",
      processing_modes: ["aggregator"],
      additional_info_needed: [
        "cardholder_name",
        "cardholder_identification_number",
      ],
      min_allowed_amount: 1,
      max_allowed_amount: 25000000,
      accreditation_time: 0,
      financial_institutions: [],
      settings: [],
    },
  ],
  ticket: [
    {
      id: "rapipago",
      name: "Rapipago",
      payment_type_id: "ticket",
      thumbnail:
        "https://http2.mlstatic.com/storage/logos-api-admin/443c5d70-571b-11ec-ae75-df2bef173be2-m.svg",
      secure_thumbnail:
        "https://http2.mlstatic.com/storage/logos-api-admin/443c5d70-571b-11ec-ae75-df2bef173be2-m.svg",
      processing_modes: ["aggregator"],
      additional_info_needed: [],
      min_allowed_amount: 2,
      max_allowed_amount: 150000,
      accreditation_time: 0,
      financial_institutions: [],
      settings: [],
    },
    {
      id: "pagofacil",
      name: "Pago Fácil",
      payment_type_id: "ticket",
      thumbnail:
        "https://http2.mlstatic.com/storage/logos-api-admin/443c5d70-571b-11ec-ae75-df2bef173be2-m.svg",
      secure_thumbnail:
        "https://http2.mlstatic.com/storage/logos-api-admin/443c5d70-571b-11ec-ae75-df2bef173be2-m.svg",
      processing_modes: ["aggregator"],
      additional_info_needed: [],
      min_allowed_amount: 2,
      max_allowed_amount: 150000,
      accreditation_time: 0,
      financial_institutions: [],
      settings: [],
    },
  ],
  bank_transfer: [
    {
      id: "pse",
      name: "Transferencia bancaria",
      payment_type_id: "bank_transfer",
      thumbnail:
        "https://http2.mlstatic.com/storage/logos-api-admin/312238e0-571b-11ec-ae75-df2bef173be2-m.svg",
      secure_thumbnail:
        "https://http2.mlstatic.com/storage/logos-api-admin/312238e0-571b-11ec-ae75-df2bef173be2-m.svg",
      processing_modes: ["aggregator"],
      additional_info_needed: [],
      min_allowed_amount: 1,
      max_allowed_amount: 25000000,
      accreditation_time: 0,
      financial_institutions: [],
      settings: [],
    },
  ],
};

export async function GET(_request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      payment_methods: paymentMethods,
    });
  } catch (error) {
    logger.error("Error getting payment methods:", { error: error });
    return NextResponse.json(
      {
        success: false,
        error: "Error obteniendo métodos de pago",
      },
      { status: 500 }
    );
  }
}

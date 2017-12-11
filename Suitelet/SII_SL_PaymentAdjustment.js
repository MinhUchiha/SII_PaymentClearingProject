/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget','N/http','N/record','N/search','N/redirect','N/format'],

function(serverWidget, http, record, search, redirect, format) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
        try{
            var request = context.request;
            if (request.method === http.Method.GET) {
                var recordId = request.parameters.custscript_custpayment_id;
                var objRecord = record.load({
                    type: 'customrecord_sii_custpayment',
                    id: recordId
                });
                var customer = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_client'});
                var paymentamo = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_paymentamo'});
                var custpayment_h_id = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_h_id'});
                var saving = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_saving'});
                var paymentamo = format.format({
                    value: paymentamo,
                    type: format.Type.INTEGER
                });
                // ÉtÉHÅ[ÉÄíËã`
                var form = serverWidget.createForm({
                    title: 'ì¸ã‡ï[ç∑äzí≤êÆ'
                });
                form.addSubmitButton({
                    label: 'ï€ë∂'
                });
                form.addButton({
                    id: 'cancelButton',
                    label: 'ÉLÉÉÉìÉZÉã',
                    functionName: 'btnCancelButton();'
                }); 
                
                var nowDate = new Date();
                nowDate = format.format({
                    value: nowDate,
                    type: format.Type.DATE
                });
                var head_id = form.addField({
                    id: 'head_id',
                    label: 'ID : ',
                    type: serverWidget.FieldType.TEXT
                });
                head_id.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
                head_id.defaultValue = custpayment_h_id;

                var savingArray = [];
                if(saving != '' && saving != null){
                    savingArray = saving.split(",");
                }
                if(savingArray.length > 0){
                    customer = savingArray[1];
                }
                //å⁄ãq
                var customerField = form.addField({
                    id: 'customer',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customer',
                    label: 'å⁄ãq'
                });

                customerField.defaultValue = customer;
                //text_customer.label = '';
                customerField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                
                var dueDateFrom = form.addField({
                    id: 'duedatefrom',
                    label: 'ä˙ì˙ (FROM)',
                    type: serverWidget.FieldType.DATE
                });
                
                var dueDateTo = form.addField({
                    id: 'duedateto',
                    label: 'ä˙ì˙ (TO)',
                    type: serverWidget.FieldType.DATE
                });
        

                var total_text = form.addField({
                    id: 'total_text',
                    label: 'çáåv',
                    type: serverWidget.FieldType.TEXT
                });
        
                total_text.defaultValue = paymentamo;
                total_text.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                total_text.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
                });

                var fee = form.addField({
                        id : 'fee',
                        type : serverWidget.FieldType.INTEGER,
                        label : 'éËêîóø'
                        });
                fee.defaultValue = 540;
                var calculation_error = form.addField({
                        id : 'calculation_error',
                        type : serverWidget.FieldType.INTEGER,
                        label : 'åvéZåÎç∑'
                        });
                calculation_error.defaultValue = -1;

                
                var subtab = form.addSubtab({
                        id : 'custpage_subtab',
                        label : 'êøãÅèëàÍóó'
                });

                var invoiceSubList  = form.addSublist({
                    id: 'invoice_sub_list',
                    type: serverWidget.SublistType.LIST,
                    label: 'êøãÅèëàÍóó',
                    tab: 'custpage_subtab'
                });
               
                var sub_list_check = invoiceSubList.addField({
                    id: 'sub_list_check',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'ff'
                });
                sub_list_check.label = '';
                invoiceSubList.addField({
                    id: 'sub_list_id',
                    type: serverWidget.FieldType.TEXT,
                    label: 'êøãÅî‘çÜ'
                });
                invoiceSubList.addField({
                    id: 'sub_list_1',
                    type: serverWidget.FieldType.DATE,
                    label: 'ä˙ì˙'
                });
                invoiceSubList.addField({
                    id: 'sub_list_2',
                    type: serverWidget.FieldType.TEXT,
                    label: 'ïîñÂ'
                });
                invoiceSubList.addField({
                    id: 'sub_list_3',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'êøãÅäz'
                }).updateDisplayType({displayType : serverWidget.FieldDisplayType.ENTRY});
                invoiceSubList.addField({
                    id: 'sub_list_4',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'ìKópäz'
                }).updateDisplayType({displayType : serverWidget.FieldDisplayType.ENTRY});
                invoiceSubList.addField({
                    id: 'sub_list_5',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'í≤êÆäz'
                }).updateDisplayType({displayType : serverWidget.FieldDisplayType.ENTRY});
                var sub_list_6 = invoiceSubList.addField({
                    id: 'sub_list_6',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'ff '
                });
                sub_list_6.label = '';
                invoiceSubList.addField({
                    id: 'sub_list_7',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'ñ¢ìKóp'
                }).updateDisplayType({displayType : serverWidget.FieldDisplayType.ENTRY});
                invoiceSubList.addField({
                    id: 'sub_list_8',
                    type: serverWidget.FieldType.SELECT,
                    source: 'account',
                    label: 'îÔópä®íËâ»ñ⁄'
                });
                invoiceSubList.addField({
                    id: 'sub_list_9',
                    type: serverWidget.FieldType.SELECT,
                    source: 'salestaxitem',
                    label: 'è¡îÔê≈'
                });
                invoiceSubList.addField({
                    id: 'sub_list_10',
                    type: serverWidget.FieldType.SELECT,
                    label: 'è¡îÔê≈ÉJÉeÉSÉä',
                    source: 'customlist_4572_main_tax_category',
                });
                
                invoiceSubList.setSublistValue({
                    id: 'sub_list_id',
                    line: 0,
                    value: 'INV0091'
                });
                invoiceSubList.setSublistValue({
                    id: 'sub_list_1',
                    line: 0,
                    value: nowDate
                });
                invoiceSubList.setSublistValue({
                    id: 'sub_list_2',
                    line: 0,
                    value: 'AAAïî'
                });
                invoiceSubList.setSublistValue({
                    id: 'sub_list_3',
                    line: 0,
                    value: 1300000
                });
                invoiceSubList.setSublistValue({
                    id: 'sub_list_4',
                    line: 0,
                    value: 299000
                });
                invoiceSubList.setSublistValue({
                    id: 'sub_list_5',
                    line: 0,
                    value: 1000
                });
                invoiceSubList.setSublistValue({
                    id: 'sub_list_6',
                    line: 0,
                    value: 'F'
                });
                invoiceSubList.setSublistValue({
                    id: 'sub_list_7',
                    line: 0,
                    value: 1000000
                });
                var settingRecord = record.load({
                    type: 'customrecord_sii_custpayment_setting',
                    id: 1
                });
                var acc = settingRecord.getValue({fieldId: 'custrecord_sii_custpayment_setting_s_acc'});
                invoiceSubList.setSublistValue({
                    id: 'sub_list_8',
                    line: 0,
                    value: acc
                });
                var taxco = settingRecord.getValue({fieldId: 'custrecord_sii_custpayment_setting_taxco'})
                invoiceSubList.setSublistValue({
                    id: 'sub_list_9',
                    line: 0,
                    value: taxco
                });
                var taxCaSetting = settingRecord.getValue({fieldId: 'custrecord_sii_custpayment_setting_taxca'});
                invoiceSubList.setSublistValue({
                    id: 'sub_list_10',
                    line: 0,
                    value: taxCaSetting
                });
                context.response.writePage(form);
            }else{
                var id = context.request.parameters.head_id;
                redirect.toSuitelet({
                    scriptId: 'customscript_sii_sl_paymentmanagement' ,
                    deploymentId: 'customdeploy_sii_sl_paymentmanagement',
                    parameters: {'custscript_custpayment_head_id': id}
                });
            }
        }catch(e){
            log.error({
                title: e.name,
                details: e.message
            });
        }
    }

    return {
        onRequest: onRequest
    };
    
});

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
                var customer = objRecord.getText({fieldId: 'custrecord_sii_custpayment_client'});
                var paymentamo = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_paymentamo'});
                var custpayment_h_id = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_h_id'});
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
                //å⁄ãq
                var label_customer = form.addField({
                    id: 'label_customer',
                    label: 'å⁄ãq : ',
                    type: serverWidget.FieldType.TEXT
                });
                label_customer.defaultValue = 'å⁄ãq: ';
                label_customer.label = '';
                label_customer.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                label_customer.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                label_customer.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
 
                var text_customer = form.addField({
                    id: 'text_customer',
                    label: 'text_customer',
                    type: serverWidget.FieldType.TEXT
                });
        
                text_customer.defaultValue = customer;
                text_customer.label = '';
                text_customer.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                
                text_customer.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                text_customer.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                
                //ä˙ì˙
                var due_date = form.addField({
                    id: 'due_date',
                    label: 'ä˙ì˙ : ',
                    type: serverWidget.FieldType.TEXT
                });
                due_date.defaultValue = 'ä˙ì˙: ';
                due_date.label = '';
                due_date.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                due_date.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                due_date.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
                
                var dueDateFrom = form.addField({
                    id: 'duedatefrom',
                    label: nowDate,
                    type: serverWidget.FieldType.DATE
                });
        
                dueDateFrom.defaultValue = nowDate;
                dueDateFrom.label = '';
                
                
                dueDateFrom.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                dueDateFrom.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                
                var paymentSpace = form.addField({
                    id: 'paymentspace',
                    label: '~',
                    type: serverWidget.FieldType.TEXT
                });
                paymentSpace.defaultValue = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                paymentSpace.label = '';
                paymentSpace.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                paymentSpace.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE                    
                });
                paymentSpace.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
                
                var dueDateTo = form.addField({
                    id: 'duedateto',
                    label: nowDate,
                    type: serverWidget.FieldType.DATE
                });
        
                dueDateTo.defaultValue = nowDate;
                dueDateTo.label = '';
                
                
                dueDateTo.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                dueDateTo.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                //éËêîóø
                var fee_label = form.addField({
                    id: 'fee_label',
                    label: 'éËêîóø : ',
                    type: serverWidget.FieldType.TEXT
                });
                fee_label.defaultValue = "<span style='margin-left: 500px'>éËêîóø</span>";
                fee_label.label = '';
                fee_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                fee_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE
                });
                fee_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                var fee = form.addField({
                        id : 'fee',
                        type : serverWidget.FieldType.TEXT,
                        label : 'éËêîóø'
                        });
                fee.defaultValue = '540';
                fee.label = '';
                fee.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                fee.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                });
                fee.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                //çáåv
                var total_label = form.addField({
                    id: 'total_label',
                    label: 'çáåv : ',
                    type: serverWidget.FieldType.TEXT
                });
                total_label.defaultValue = 'çáåv: ';
                total_label.label = '';
                total_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                total_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                total_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });

 
                var total_text = form.addField({
                    id: 'total_text',
                    label: 'total_text',
                    type: serverWidget.FieldType.TEXT
                });
        
                total_text.defaultValue = paymentamo;
                total_text.label = '';
                total_text.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                
                total_text.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                total_text.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                
                var subtab = form.addSubtab({
                        id : 'custpage_subtab',
                        label : 'êøãÅèëàÍóó'
                });

                //åvéZåÎç∑
                var calculation_error_label = form.addField({
                    id: 'calculation_error_label',
                    label: 'åvéZåÎç∑ : ',
                    type: serverWidget.FieldType.TEXT
                });
                calculation_error_label.defaultValue = "<span style='margin-left: 565px'>åvéZåÎç∑</span>";
                calculation_error_label.label = '';
                calculation_error_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                calculation_error_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE
                });
                calculation_error_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                var calculation_error = form.addField({
                        id : 'calculation_error',
                        type : serverWidget.FieldType.TEXT,
                        label : 'åvéZåÎç∑'
                        });
                calculation_error.defaultValue = "-1";
                calculation_error.label = '';
                calculation_error.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                calculation_error.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                });
                calculation_error.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                /*var calculation_error = form.addField({
                        id : 'textfield',
                        type : serverWidget.FieldType.TEXT,
                        label : 'åvéZåÎç∑',
                        container: 'custpage_subtab'
                        });*/
                
                // êøãÅèëàÍóó
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
                });
                invoiceSubList.addField({
                    id: 'sub_list_4',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'ìKópäz'
                });
                invoiceSubList.addField({
                    id: 'sub_list_5',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'í≤êÆäz'
                });
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
                });
                invoiceSubList.addField({
                    id: 'sub_list_8',
                    type: serverWidget.FieldType.SELECT,
                    label: 'îÔópä®íËâ»ñ⁄'
                }).addSelectOption({
                    value: 1,
                    text: 'ëdê≈åˆâ€:àÛéÜë„'
                });
                invoiceSubList.addField({
                    id: 'sub_list_9',
                    type: serverWidget.FieldType.SELECT,
                    label: 'è¡îÔê≈'
                }).addSelectOption({
                    value: 1,
                    text: '8%'
                });
                invoiceSubList.addField({
                    id: 'sub_list_10',
                    type: serverWidget.FieldType.SELECT,
                    label: 'è¡îÔê≈ÉJÉeÉSÉä'
                }).addSelectOption({
                    value: 1,
                    text: 'ã§í ëŒâû'
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
                invoiceSubList.setSublistValue({
                    id: 'sub_list_8',
                    line: 0,
                    value: 1
                });
                invoiceSubList.setSublistValue({
                    id: 'sub_list_9',
                    line: 0,
                    value: 1
                });
                invoiceSubList.setSublistValue({
                    id: 'sub_list_10',
                    line: 0,
                    value: 1
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

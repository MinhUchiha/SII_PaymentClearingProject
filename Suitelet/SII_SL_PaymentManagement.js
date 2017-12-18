/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget','N/http','N/record','N/search','N/redirect','N/format', 'N/runtime', 'N/url'],

function(serverWidget, http, record, search, redirect, format, runtime, url) {
   
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
            var scriptObj = runtime.getCurrentScript();
            var clientScriptFileId = scriptObj.getParameter({name: 'custscript_paymentmanagement_client_file'})
            var request = context.request;
            var recordId = request.parameters.custscript_custpayment_head_id;
            if (request.method === http.Method.GET) {
                var objRecord = record.load({
                    type: 'customrecord_sii_custpayment_h',
                    id: recordId
                });
                var importDate = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_importdate'});
                /*importDate = format.format({
                    value: importDate,
                    type: format.Type.DATE
                });*/
                var importPerson = objRecord.getText({fieldId: 'custrecord_sii_custpayment_importperson'});
                var fromDate = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_date_from'});
                var toDate = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_date_to'});
                var amountSum = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_amountsum'});
                var amountSumString = format.format({
                    value: amountSum,
                    type: format.Type.INTEGER
                });
                var importNumber = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_importnumber'});
                importNumber = format.format({
                    value: importNumber,
                    type: format.Type.INTEGER
                });
                var status = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_status'});
                var name = objRecord.getValue({fieldId: 'name'});
                var saveAcc = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_saving_acc'});
                var saveTaxCo = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_saving_taxco'});
                var saveTaxCa = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_saving_taxca'});
                var saveError = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_saving_error'});
                var savePlus = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_saving_plus'});
                var saveMinus = objRecord.getValue({fieldId: 'custrecord_sii_custpayment_saving_minus'});
                 var settingList = getSetting();
                var setting = settingList.getRange({
                    start: 0,
                    end: 1
                })[0];
                if(isEmpty(saveAcc)){
                    saveAcc = setting.getValue({name: 'custrecord_sii_custpayment_setting_acc'});
                }
                if(isEmpty(saveTaxCo)){
                    saveTaxCo = setting.getValue({name: 'custrecord_sii_custpayment_setting_taxco'});
                }
                if(isEmpty(saveTaxCa)){
                    saveTaxCa = setting.getValue({name: 'custrecord_sii_custpayment_setting_taxca'});
                }
                if(isEmpty(saveError)){
                    saveError = setting.getValue({name: 'custrecord_sii_custpayment_setting_error'});
                }
                if(isEmpty(savePlus)){
                    savePlus = setting.getValue({name: 'custrecord_sii_custpayment_setting_plus'});
                }
                if(isEmpty(saveMinus)){
                    saveMinus = setting.getValue({name: 'custrecord_sii_custpayment_setting_minus'});
                }
                // tH[è`
                var form = serverWidget.createForm({
                    title: 'üàÇ['
                });
                form.addSubmitButton({
                    label: 'Û¶'
                });
                form.addButton({
                    id: 'cancelButton',
                    label: 'LZ',
                    functionName: 'window.history.go(-1);'
                }); 
                form.addButton({
                    id: 'runButton',
                    label: 'Às',
                    functionName: 'btnRunButton('+recordId+');'
                });

                //id
                var head_id = form.addField({
                    id: 'head_id',
                    label: 'id : ',
                    type: serverWidget.FieldType.TEXT
                });
                head_id.defaultValue = recordId;
                head_id.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
                //æú
                var textNowDate = form.addField({
                    id: 'textdate',
                    label: 'æú',
                    type: serverWidget.FieldType.DATE
                });
                textNowDate.defaultValue = importDate;
                textNowDate.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                
                var paymentDateFrom = form.addField({
                    id: 'paymentdatefrom',
                    label: 'üàú (FROM)',
                    type: serverWidget.FieldType.DATE
                });
                paymentDateFrom.defaultValue = fromDate;

                var paymentDateTo = form.addField({
                    id: 'paymentdateto',
                    label: 'üàú (TO)',
                    type: serverWidget.FieldType.DATE
                });
                paymentDateTo.defaultValue = toDate;

                var textStatus = form.addField({
                    id: 'textstatus',
                    label: 'Xe[^X',
                    type: serverWidget.FieldType.TEXT
                });
                if(status == 2){
                    textStatus.defaultValue = "æ¸s";
                }else{
                    textStatus.defaultValue = "³íæ";
                }
                textStatus.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                var textUser = form.addField({
                    id: 'textuser',
                    label: 'æSÒ',
                    type: serverWidget.FieldType.TEXT
                });
                textUser.defaultValue = importPerson;
                textUser.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
 
                var textNumber = form.addField({
                    id: 'textnumber',
                    label: 'æ',
                    type: serverWidget.FieldType.TEXT
                });
                textNumber.defaultValue = importNumber;
                textNumber.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
 
                //vàz
 
                var textTotal = form.addField({
                    id: 'texttotal',
                    label: 'vàz',
                    type: serverWidget.FieldType.TEXT
                });
                textTotal.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                // üàÇê
                var paymentSubList  = form.addSublist({
                    id: 'payment_sub_list',
                    type: serverWidget.SublistType.LIST,
                    label: 'üàÇê'
                });

                paymentSubList.addField({
                    id: 'id',
                    type: serverWidget.FieldType.TEXT,
                    label: 'ID'
                }).updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN});
                paymentSubList.addField({
                    id: 'sub_list_check',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: ''
                });
                paymentSubList.addField({
                    id: 'sub_list_id',
                    type: serverWidget.FieldType.TEXT,
                    label: 'üàÔ'
                });
                paymentSubList.addField({
                    id: 'sub_list_2',
                    type: serverWidget.FieldType.TEXT,
                    label: '¾ÓæNo.'
                });
                var customerSelect = paymentSubList.addField({
                    id: 'sub_list_3',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customer',
                    label: 'Úq'
                });
                paymentSubList.addField({
                    id: 'client_half',
                    type: serverWidget.FieldType.TEXT,
                    label: '¼pJiÐ¼'
                });
                paymentSubList.addField({
                    id: 'sub_list_4',
                    type: serverWidget.FieldType.DATE,
                    label: 'üàú'
                });
                paymentSubList.addField({
                    id: 'sub_list_5',
                    type: serverWidget.FieldType.TEXT,
                    label: 'âs'
                });
                paymentSubList.addField({
                    id: 'sub_list_6',
                    type: serverWidget.FieldType.TEXT,
                    label: 'xX'
                });
                paymentSubList.addField({
                    id: 'sub_list_7',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Ël'
                });
                paymentSubList.addField({
                    id: 'sub_list_8',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'üàz'
                });
                paymentSubList.addField({
                    id: 'sub_list_9',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Â v'
                });
                paymentSubList.addField({
                    id: 'sub_list_10',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'êv'
                });
                paymentSubList.addField({
                    id: 'sub_list_11',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'ÁïÅ'
                });
                paymentSubList.addField({
                    id: 'sub_list_12',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'è¿'
                });
                paymentSubList.addField({
                    id: 'sub_list_13',
                    type: serverWidget.FieldType.TEXT,
                    label: '·z²®îñi[GA'
                }).updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
                var i = 0;
                var totalamount = 0;
                var resultSet = getPaymentList(recordId);
                var invoiceList = getInvoice();
                var feeList = getFee();
                resultSet.each(function(result) {
                    var sub_list_id = result.getValue({
                        name: 'custrecord_sii_custpayment_depositnum'
                    });
                    var exclusion = result.getValue({
                        name: 'custrecord_sii_custpayment_exclusion'
                    });
                    var customerno = result.getValue({
                        name: 'custrecord_sii_custpayment_customerno'});
                    var client = result.getValue({
                        name: 'custrecord_sii_custpayment_client'
                    });
                    var paymentdate = result.getValue({
                        name: 'custrecord_sii_custpayment_paymentdate'
                    });
                    var bank = result.getValue({
                        name: 'custrecord_sii_custpayment_bank'
                    });
                    var branchoff = result.getValue({
                        name: 'custrecord_sii_custpayment_branchoff'
                    });
                    var request = result.getValue({
                        name: 'custrecord_sii_custpayment_request'
                    });
                    var paymentamo = result.getValue({
                        name: 'custrecord_sii_custpayment_paymentamo'
                    });
                    var claimsum = result.getValue({
                        name: 'custrecord_sii_custpayment_claimsum'
                    });
                    var client_half = result.getValue({
                        name: 'custrecord_sii_custpayment_client_half'
                    });
                    invoiceList.each(function(result) {
                        entity = result.getValue(invoiceList.columns[0]);
                        amount = result.getValue(invoiceList.columns[1]);
                        if(entity == client){
                            claimsum = parseInt(amount);
                        }
                        return true;
                    })
                    var match = result.getValue({
                        name: 'custrecord_sii_custpayment_match'
                    });
                    var consumption = result.getValue({
                        name: 'custrecord_sii_custpayment_consumption'
                    });
                    var fee = result.getValue({
                        name: 'custrecord_sii_custpayment_fee'
                    });
                    var feeId;
                    var erorrParam;
                    if(claimsum == paymentamo){
                        match = true;
                    }else{
                        var erorr = claimsum - paymentamo;
                        feeList.each(function(result) {
                            var sumFee = result.getValue({name: 'custrecord_sii_custfee_sum'});
                            if(sumFee == erorr){
                                fee = true;
                                feeId = sumFee;              
                            }else{
                                if(Math.abs(erorr) <= saveError){
                                    consumption = true;
                                    erorrParam = erorr;
                                }
                                if(Math.abs(erorr - sumFee) <= saveError){
                                    consumption = true;
                                    fee = true;
                                    erorrParam = erorr - sumFee;
                                    feeId = sumFee;
                                }
                            }
                        
                            return true;
                        });
                    }
                    paymentSubList.setSublistValue({
                        id: 'id',
                        line: i,
                        value: result.id
                    });
                    if(exclusion){
                        paymentSubList.setSublistValue({
                            id: 'sub_list_check',
                            line: i,
                            value: 'T'
                        });
                    }else{
                        paymentSubList.setSublistValue({
                            id: 'sub_list_check',
                            line: i,
                            value: 'F'
                        });
                        if(checkDate(paymentdate, fromDate, toDate)){
                            totalamount += parseInt(paymentamo);
                        }
                    }
                    var output = url.resolveScript({
                        scriptId: 'customscript_sii_sl_paymentadjustment',
                        deploymentId: 'customdeploy_sii_sl_paymentadjustment',
                        returnExternalUrl: false,
                        params: {
                            'custscript_custpayment_id': result.id,
                            'match': match,
                            'consumption': erorrParam,
                            'fee': feeId
                        }
                    });
                    paymentSubList.setSublistValue({
                        id: 'sub_list_id',
                        line: i,
                        value: '<a href=\'#\' onClick="MyWindow=window.open(\''+output+'\',\'\',\'width=1400,height=700\'); return false;">'+sub_list_id+'</a>'
                    });
                    if(customerno == null || customerno == ''){
                        paymentSubList.setSublistValue({
                            id: 'sub_list_2',
                            line: i,
                            value: ' '
                        });
                    }else{
                        paymentSubList.setSublistValue({
                            id: 'sub_list_2',
                            line: i,
                            value: customerno
                        });
                    }
                    if(client == null || client == ''){
                        paymentSubList.setSublistValue({
                            id: 'sub_list_3',
                            line: i,
                            value: 0
                        });
                    }else{
                        paymentSubList.setSublistValue({
                            id: 'sub_list_3',
                            line: i,
                            value: client
                        });
                    }
                    if(client_half == null || client_half == ''){
                        paymentSubList.setSublistValue({
                            id: 'client_half',
                            line: i,
                            value: ' '
                        });
                    }else{
                        paymentSubList.setSublistValue({
                            id: 'client_half',
                            line: i,
                            value: client_half
                        });
                    }
                    paymentSubList.setSublistValue({
                        id: 'sub_list_4',
                        line: i,
                        value: paymentdate
                    });
                    paymentSubList.setSublistValue({
                        id: 'sub_list_5',
                        line: i,
                        value: bank
                    });
                    paymentSubList.setSublistValue({
                        id: 'sub_list_6',
                        line: i,
                        value: branchoff
                    });
                    paymentSubList.setSublistValue({
                        id: 'sub_list_7',
                        line: i,
                        value: request
                    });
                    paymentSubList.setSublistValue({
                        id: 'sub_list_8',
                        line: i,
                        value: paymentamo
                    });
                    if(claimsum == null || claimsum == ''){
                        paymentSubList.setSublistValue({
                            id: 'sub_list_9',
                            line: i,
                            value: 0
                    });
                    }else{
                        paymentSubList.setSublistValue({
                            id: 'sub_list_9',
                            line: i,
                            value: claimsum
                        });
                    }
                    if(match){
                        paymentSubList.setSublistValue({
                            id: 'sub_list_10',
                            line: i,
                            value: 'T'
                        });
                    }else{
                        paymentSubList.setSublistValue({
                            id: 'sub_list_10',
                            line: i,
                            value: 'F'
                        });
                    }
                    if(consumption){
                        paymentSubList.setSublistValue({
                            id: 'sub_list_11',
                            line: i,
                            value: 'T'
                        });
                    }else{
                        paymentSubList.setSublistValue({
                            id: 'sub_list_11',
                            line: i,
                            value: 'F'
                        });
                    }
                    if(fee){
                        paymentSubList.setSublistValue({
                            id: 'sub_list_12',
                            line: i,
                            value: 'T'
                        });
                    }else{
                        paymentSubList.setSublistValue({
                            id: 'sub_list_12',
                            line: i,
                            value: 'F'
                        });
                    }
                    i++;
                    return true;
                });
                totalamount = format.format({
                    value: totalamount,
                    type: format.Type.INTEGER
                });
                textTotal.defaultValue = totalamount;
                var tab = form.addTab({
                    id : 'tabid',
                    label : 'Tab'
                });
                //è¿¨è
                var commissionSubtab = form.addSubtab({
                    id : 'commission',
                    label : 'è¿¨è',
                    tab: 'tabid'
                });
              
                var fee_account_item_label = form.addField({
                    id: 'fee_account_item_label',
                    label: 'è¿¨èÈÚ',
                    type: serverWidget.FieldType.TEXT,
                    container: 'commission'
                });
                fee_account_item_label.defaultValue = 'è¿¨èÈÚ';
                fee_account_item_label.label = '';
                fee_account_item_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                fee_account_item_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                fee_account_item_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });

                var fee_account_item = form.addField({
                    id: 'fee_account_item',
                    type: serverWidget.FieldType.SELECT,
                    label: 'fee_account_item',
                    source: 'account',
                    container: 'commission'
                });
                fee_account_item.label = '';

                
                fee_account_item.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                fee_account_item.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                
                var tax_code_label = form.addField({
                    id: 'tax_code_label',
                    label: 'ÁïÅR[h',
                    type: serverWidget.FieldType.TEXT,
                    container: 'commission'
                });
                tax_code_label.defaultValue = 'ÁïÅR[h&nbsp;&nbsp;';
                tax_code_label.label = '';
                tax_code_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                tax_code_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                tax_code_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
 
                var tax_code = form.addField({
                    id: 'tax_code',
                    label: 'tax_code',
                    type: serverWidget.FieldType.SELECT,
                    source: 'salestaxitem',
                    container: 'commission'
                });
                    
                tax_code.label = '';

                
                tax_code.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                tax_code.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                
                var tax_category_label = form.addField({
                    id: 'tax_category_label',
                    label: 'ÁïÅJeS ',
                    type: serverWidget.FieldType.TEXT,
                    container: 'commission'
                });
                tax_category_label.defaultValue = 'ÁïÅJeS ';
                tax_category_label.label = '';
                tax_category_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                tax_category_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                tax_category_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
 
                var tax_category = form.addField({
                    id: 'tax_category',
                    label: 'tax_category',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customlist_4572_main_tax_category',
                    container: 'commission'
                });
                    
                tax_category.label = '';

                
                tax_category.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                tax_category.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });

                //ë·Î
                var errorSubtab = form.addSubtab({
                    id : 'error_subtab',
                    label : 'ë·Î',
                    tab: 'tabid'
                });
              
                var error_difference_label = form.addField({
                    id: 'error_difference_label',
                    label: 'ë·F¯·z',
                    type: serverWidget.FieldType.TEXT,
                    container: 'error_subtab'
                });
                error_difference_label.defaultValue = 'ë·F¯·z';
                error_difference_label.label = '';
                error_difference_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                error_difference_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                error_difference_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
 
                var error_difference = form.addField({
                    id: 'error_difference',
                    label: 'error_difference',
                    type: serverWidget.FieldType.INTEGER,
                    container: 'error_subtab'
                });
                    
                error_difference.label = '';

                
                error_difference.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                error_difference.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                
                var plus_error_label = form.addField({
                    id: 'plus_error_label',
                    label: 'vXë·',
                    type: serverWidget.FieldType.TEXT,
                    container: 'error_subtab'
                });
                plus_error_label.defaultValue = 'vXë· &nbsp;';
                plus_error_label.label = '';
                plus_error_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                plus_error_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                plus_error_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
 
                var plus_error = form.addField({
                    id: 'plus_error',
                    label: 'plus_error',
                    type: serverWidget.FieldType.SELECT,
                    source: 'account',
                    container: 'error_subtab'
                });
                    
                plus_error.label = '';

                
                plus_error.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                plus_error.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                
                var minus_error_label = form.addField({
                    id: 'minus_error_label',
                    label: '}CiXë· ',
                    type: serverWidget.FieldType.TEXT,
                    container: 'error_subtab'
                });
                minus_error_label.defaultValue = '}CiXë· ';
                minus_error_label.label = '';
                minus_error_label.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                minus_error_label.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                minus_error_label.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTROW
                });
 
                var minus_error = form.addField({
                    id: 'minus_error',
                    label: 'minus_error',
                    type: serverWidget.FieldType.SELECT,
                    source: 'account',
                    container: 'error_subtab'
                });
                    
                minus_error.label = '';

                
                minus_error.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDE
                    
                });
                minus_error.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
            
                fee_account_item.defaultValue = saveAcc;
                tax_code.defaultValue = saveTaxCo;
                tax_category.defaultValue = saveTaxCa;
                error_difference.defaultValue = saveError;
                plus_error.defaultValue = savePlus;
                minus_error.defaultValue = saveMinus;
                form.clientScriptFileId = clientScriptFileId;
                context.response.writePage(form);
            }else{
                var id = context.request.parameters.head_id;
                var texttotal = context.request.parameters.texttotal;
                var fee_account_item = context.request.parameters.fee_account_item;
                var tax_code = context.request.parameters.tax_code;
                var tax_category = context.request.parameters.tax_category;
                var error_difference = context.request.parameters.error_difference;
                var plus_error = context.request.parameters.plus_error;
                var minus_error = context.request.parameters.minus_error;
                var saveRecord = record.load({
                    type: 'customrecord_sii_custpayment_h',
                    id: id
                });
                var dateFrom = context.request.parameters.paymentdatefrom;
                if(!isEmpty(dateFrom)){
                    dateFrom = format.parse({
                        value: dateFrom,
                        type: format.Type.DATE
                    });
                    dateFrom = new Date(dateFrom);
                    saveRecord.setValue({
                        fieldId: 'custrecord_sii_custpayment_date_from',
                        value: dateFrom
                    });
                }
                var dateTo = context.request.parameters.paymentdateto;
                if(!isEmpty(dateTo)){
                    dateTo = format.parse({
                        value: dateTo,
                        type: format.Type.DATE
                    });
                    dateTo = new Date(dateTo)
                    saveRecord.setValue({
                        fieldId: 'custrecord_sii_custpayment_date_to',
                        value: dateTo
                    });
                }
                saveRecord.setValue({
                    fieldId: 'custrecord_sii_custpayment_amountsum',
                    value: getInt(texttotal)
                });
                saveRecord.setValue({
                    fieldId: 'custrecord_sii_custpayment_saving_acc',
                    value: fee_account_item
                });
                saveRecord.setValue({
                    fieldId: 'custrecord_sii_custpayment_saving_taxco',
                    value: tax_code
                });
                saveRecord.setValue({
                    fieldId: 'custrecord_sii_custpayment_saving_taxca',
                    value: tax_category
                });
                saveRecord.setValue({
                    fieldId: 'custrecord_sii_custpayment_saving_error',
                    value: error_difference
                });
                saveRecord.setValue({
                    fieldId: 'custrecord_sii_custpayment_saving_plus',
                    value: plus_error
                });
                saveRecord.setValue({
                    fieldId: 'custrecord_sii_custpayment_saving_minus',
                    value: minus_error
                });
                saveRecord.save();
                redirect.toRecord({
                    type : 'customrecord_sii_custpayment_h',
                    id : id
                });
            }
            
        }catch(e){
            log.error({
                title: e.name,
                details: e.message
            });
        }
    }

    function getPaymentList(paymentListHeadId){
        var myPaymentListSearch = search.create({
            type: 'customrecord_sii_custpayment',
            columns: [{
                name: 'custrecord_sii_custpayment_depositnum',
                sort: search.Sort.ASC
            }, {
                name: 'custrecord_sii_custpayment_exclusion'
            }, {
                name: 'custrecord_sii_custpayment_depositacc'
            }, {
                name: 'custrecord_sii_custpayment_customerno'
            }, {
                name: 'custrecord_sii_custpayment_client'
            }, {
                name: 'custrecord_sii_custpayment_paymentdate'
            },{
                name: 'custrecord_sii_custpayment_bank'
            },{
                name: 'custrecord_sii_custpayment_branchoff'
            },{
                name: 'custrecord_sii_custpayment_request'
            },{
                name: 'custrecord_sii_custpayment_paymentamo'
            },{
                name: 'custrecord_sii_custpayment_claimsum'
            },{
                name: 'custrecord_sii_custpayment_match'
            },{
                name: 'custrecord_sii_custpayment_consumption'
            },{
                name: 'custrecord_sii_custpayment_fee'
            },{
                name: 'custrecord_sii_custpayment_client_half'
            }],
            filters: [{
                name: 'custrecord_sii_custpayment_h_id',
                operator: search.Operator.IS,
                values: [paymentListHeadId]
            }]
        });
        var resultSet = myPaymentListSearch.run();
        return( myPaymentListSearch.run() );
    }

    function getSetting(){
        var mysearch = search.create({
            type: 'customrecord_sii_custpayment_setting',
            columns: [{
                name: 'custrecord_sii_custpayment_setting_acc'
            },{
                name: 'custrecord_sii_custpayment_setting_taxco'
            },{
                name: 'custrecord_sii_custpayment_setting_taxca'
            },{
                name: 'custrecord_sii_custpayment_setting_error'
            },{
                name: 'custrecord_sii_custpayment_setting_plus'
            },{
                name: 'custrecord_sii_custpayment_setting_minus'
            }]
        });
        var resultSet = mysearch.run();
        return( resultSet );
    }

    function getInvoice(){
        var mysearch = search.load({
            id: 'customsearch_sii_custpayment_invoice'
        });
        var resultSet = mysearch.run();
        return( resultSet );
    }

    function getInt(stringNumber){
        stringNumber = stringNumber.split(",");
        var stringtotal = '';
        stringNumber.forEach(function(item, index){
            stringtotal = stringtotal+item;
        });
        stringNumber = parseInt(stringtotal);
        return stringNumber;
    }

    function getFee(){
        var mysearch = search.create({
            type: 'customrecord_sii_custfee',
            columns: [{
                name: 'name'
            },{
                name: 'custrecord_sii_custfee_sum'
            }]
        });
        var resultSet = mysearch.run();
        return( resultSet );
    }

    function checkDate(paymentDate, fromDate, toDate){
        if(!isEmpty(fromDate)){
            if(!isEmpty(toDate)){
                if(paymentDate >= fromDate && paymentDate <= toDate){
                    return true;
                }else{
                    return false;
                }
            }else{
                if(paymentDate >= fromDate){
                    return true;
                }else{
                    return false;
                }
            }
        }else{
            if(!isEmpty(toDate)){
                if(paymentDate <= toDate){
                    return true;
                }else{
                    return false;
                }
            }else{
                if(paymentDate >= fromDate){
                    return true;
                }else{
                    return false;
                }
            }
        }
    }

    function isEmpty(stValue) {
            if ((stValue == null) || (stValue == '') || (stValue == undefined)) {
                return true;
            } else {
                return false;
            }
        }

    return {
        onRequest: onRequest
    };
    
});

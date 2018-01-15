/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 *
 * 入金管理編集を行う
 *
 * Version    Date            Author           Remarks
 * 1.00       2018/01/09      Astop            Initial
 *
 */
define(['N/ui/serverWidget','N/http','N/record','N/search','N/redirect','N/format','N/runtime'],

function(serverWidget, http, record, search, redirect, format, runtime) {
   
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
              //Get parameter
              var recordId = request.parameters.custscript_custpayment_id;
              var feeParameters = request.parameters.fee;
              var consumptionParameters = request.parameters.consumption;

                var objRecord = record.load({
                    type: 'customrecord_sii_custpayment',
                    id: recordId
                });
                var scriptObj = runtime.getCurrentScript();
                var clientScriptFileId = scriptObj.getParameter({
                  name: 'custscript_paymentadjustment_client_file'
                });
                var customer = objRecord.getValue({
                  fieldId: 'custrecord_sii_custpayment_client'
                });
                var paymentamo = objRecord.getValue({
                  fieldId: 'custrecord_sii_custpayment_paymentamo'
                });
                var custpayment_h_id = objRecord.getValue({
                  fieldId: 'custrecord_sii_custpayment_h_id'
                });
                var saving = objRecord.getValue({
                  fieldId: 'custrecord_sii_custpayment_saving'
                });
                // フォーム定義
                var form = serverWidget.createForm({
                    title: '入金票差額調整'
                });
                form.addSubmitButton({
                    label: '保存'
                });
                form.addButton({
                    id: 'cancelButton',
                    label: 'キャンセル',
                    functionName: 'btnReturnButton();'
                }); 
                
                var nowDate = getNowDateJP();
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
                var payment_id = form.addField({
                    id: 'payment_id',
                    label: 'ID : ',
                    type: serverWidget.FieldType.TEXT
                });
                payment_id.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
                payment_id.defaultValue = recordId;
                var save = null;
                if(saving != '' && saving != null){
                    save = JSON.parse(saving);
                    if(save.client != '' && save.client != null){
                        customer = save.client;
                    }
                    if(!isEmpty(save.feeValue)){
                        feeParameters = save.feeValue;
                    }
                    if(!isEmpty(save.calculationValue)){
                        consumptionParameters = save.calculationValue;
                    }
                }

                //顧客
                var customerField = form.addField({
                    id: 'customer',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customer',
                    label: '顧客'
                });

                customerField.defaultValue = customer;
                customerField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                
                /*var dueDateFrom = form.addField({
                    id: 'duedatefrom',
                    label: '期日 (FROM)',
                    type: serverWidget.FieldType.DATE
                });
                
                var dueDateTo = form.addField({
                    id: 'duedateto',
                    label: '期日 (TO)',
                    type: serverWidget.FieldType.DATE
                });*/
        

                var total_text = form.addField({
                    id: 'total_text',
                    label: '合計',
                    type: serverWidget.FieldType.TEXT
                });
        
                total_text.defaultValue = format.format({
                    value: paymentamo,
                    type: format.Type.INTEGER
                });
                total_text.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                //適用可能額
                var applicable_amount = form.addField({
                    id: 'applicable_amount',
                    label: '適用可能額',
                    type: serverWidget.FieldType.TEXT
                });

                applicable_amount.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.STARTROW
                });
                applicable_amount.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                var applicableamount = paymentamo;
                var fee = form.addField({
                    id : 'fee',
                    type : serverWidget.FieldType.INTEGER,
                    label : '手数料'
                });

                var oldfee = form.addField({
                    id : 'oldfee',
                    type : serverWidget.FieldType.INTEGER,
                    label : '手数料'
                });
                oldfee.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
                if(feeParameters != null && feeParameters != ''){
                    fee.defaultValue = feeParameters;
                   // oldfee.defaultValue = feeParameters;
                    applicableamount = applicableamount - feeParameters;
                }else{
                    oldfee.defaultValue = 0;
                }
                var calculation_error = form.addField({
                    id : 'calculation_error',
                    type : serverWidget.FieldType.INTEGER,
                    label : '計算誤差'
                });
                var oldCalculationError = form.addField({
                    id : 'old_calculation_error',
                    type : serverWidget.FieldType.INTEGER,
                    label : '手数料'
                });
                oldCalculationError.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
                if(consumptionParameters != null && consumptionParameters != ''){
                    calculation_error.defaultValue = consumptionParameters;
                    applicableamount = applicableamount - consumptionParameters;
                    //oldCalculationError.defaultValue = consumptionParameters;
                }else{
                    oldCalculationError =  0;
                }


                var subtab = form.addSubtab({
                        id : 'custpage_subtab',
                        label : '請求書一覧'
                });

                var invoiceSubList  = form.addSublist({
                    id: 'invoice_sub_list',
                    type: serverWidget.SublistType.LIST,
                    label: '請求書一覧',
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
                    label: '請求番号'
                });
                invoiceSubList.addField({
                    id: 'id',
                    type: serverWidget.FieldType.TEXT,
                    label: 'invoiceID'
                });
                invoiceSubList.addField({
                    id: 'sub_list_1',
                    type: serverWidget.FieldType.DATE,
                    label: '期日'
                });
                invoiceSubList.addField({
                    id: 'entity',
                    type: serverWidget.FieldType.SELECT,
                    source: 'account',
                    label: '勘定科目'
                });
                invoiceSubList.addField({
                    id: 'sub_list_2',
                    type: serverWidget.FieldType.TEXT,
                    label: '部門'
                });
                invoiceSubList.addField({
                    id: 'sub_list_3',
                    type: serverWidget.FieldType.CURRENCY,
                    label: '請求額'
                });
                invoiceSubList.addField({
                    id: 'sub_list_4',
                    type: serverWidget.FieldType.INTEGER,
                    label: '適用額'
                }).updateDisplayType({displayType : serverWidget.FieldDisplayType.ENTRY});
                invoiceSubList.addField({
                    id: 'sub_list_5',
                    type: serverWidget.FieldType.INTEGER,
                    label: '調整額'
                }).updateDisplayType({displayType : serverWidget.FieldDisplayType.ENTRY});
                var sub_list_6 = invoiceSubList.addField({
                    id: 'sub_list_6',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'ff '
                });
                sub_list_6.label = '';
                invoiceSubList.addField({
                    id: 'sub_list_7',
                    type: serverWidget.FieldType.INTEGER,
                    label: '未適用'
                }).updateDisplayType({displayType : serverWidget.FieldDisplayType.ENTRY});
                invoiceSubList.addField({
                    id: 'sub_list_8',
                    type: serverWidget.FieldType.SELECT,
                    source: 'account',
                    label: '費用勘定科目'
                });
                invoiceSubList.addField({
                    id: 'sub_list_9',
                    type: serverWidget.FieldType.SELECT,
                    source: 'salestaxitem',
                    label: '消費税'
                });
                var invoiceList = getInvoiceList();
                invoiceSubList.addField({
                    id: 'sub_list_10',
                    type: serverWidget.FieldType.SELECT,
                    label: '消費税カテゴリ',
                    source: 'customlist_4572_main_tax_category',
                });
                var i = 0;
                invoiceList.each(function(result) {
                    var invoiceCustomer = result.getValue(invoiceList.columns[0]);
                    var tranid = result.getValue(invoiceList.columns[2]);
                    var duedate = result.getValue(invoiceList.columns[7]);
                    var amount = result.getValue(invoiceList.columns[3]);
                    var amountremaining = result.getValue(invoiceList.columns[4]);
                    var department = result.getText(invoiceList.columns[6]);
                    var entity = result.getValue(invoiceList.columns[8]);
                    var adjustment = null;
                    var settingRecord = record.load({
                        type: 'customrecord_sii_custpayment_setting',
                        id: 1
                    });
                    var acc = settingRecord.getValue({fieldId: 'custrecord_sii_custpayment_setting_s_acc'});
                    var taxco = settingRecord.getValue({fieldId: 'custrecord_sii_custpayment_setting_taxco'});
                    var taxCaSetting = settingRecord.getValue({fieldId: 'custrecord_sii_custpayment_setting_taxca'});
                    if(invoiceCustomer === customer ){
                        invoiceSubList.setSublistValue({
                            id: 'sub_list_id',
                            line: i,
                            value: tranid
                        });
                        invoiceSubList.setSublistValue({
                            id: 'id',
                            line: i,
                            value: result.id
                        });
                        if(isEmpty(save) || isEmpty(save.invoice)){
                            var applied = 0;
                            if(paymentamo < amountremaining){
                                applied = parseInt(paymentamo);
                                paymentamo = 0;
                            }else{
                                applied = parseInt(amountremaining);
                                paymentamo = paymentamo - amountremaining;
                            }
                            if(applied != 0){
                                invoiceSubList.setSublistValue({
                                    id: 'sub_list_4',
                                    line: i,
                                    value: applied.toString()
                                });
                                applicableamount = applicableamount - applied;
                                invoiceSubList.setSublistValue({
                                    id: 'sub_list_check',
                                    line: i,
                                    value: 'T'
                                });
                            }
                            invoiceSubList.setSublistValue({
                                id: 'sub_list_6',
                                line: i,
                                value: 'F'
                            });
                            invoiceSubList.setSublistValue({
                                id: 'sub_list_7',
                                line: i,
                                value: (amountremaining - applied).toString()
                            });
                        }else{
                            var invoicesArray = save.invoice;
                            for(var j =0; j < invoicesArray.length; j++){
                                if(invoicesArray[j].id == result.id){
                                    check = invoicesArray[j].check;
                                    applied = invoicesArray[j].applied;
                                    entity = invoicesArray[j].entity;
                                    adjustment = invoicesArray[j].adjustment;
                                    check2 = invoicesArray[j].check_2;
                                    account = invoicesArray[j].account;
                                    taxco = invoicesArray[j].taxco;
                                    taxCaSetting = invoicesArray[j].taxCaSetting;
                                    invoiceSubList.setSublistValue({
                                        id: 'sub_list_check',
                                        line: i,
                                        value: check
                                    });
                                    invoiceSubList.setSublistValue({
                                        id: 'sub_list_6',
                                        line: i,
                                        value: check2
                                    });
                                    if(!isEmpty(applied)){
                                        invoiceSubList.setSublistValue({
                                            id: 'sub_list_4',
                                            line: i,
                                            value: applied.toString()
                                        });
                                    }else{
                                        applied = 0;
                                    }
                                    if(!isEmpty(adjustment)){
                                        invoiceSubList.setSublistValue({
                                            id: 'sub_list_5',
                                            line: i,
                                            value: adjustment.toString()
                                        });
                                    }else{
                                        adjustment = 0;
                                    }
                                    applicableamount = applicableamount - applied - adjustment;
                                    invoiceSubList.setSublistValue({
                                        id: 'sub_list_7',
                                        line: i,
                                        value: (amountremaining - applied - adjustment).toString()
                                    });
                                    break;
                                }
                            }
                        }
                        if(duedate != null && duedate !== ''){
                            invoiceSubList.setSublistValue({
                                id: 'sub_list_1',
                                line: i,
                                value: duedate
                            });
                        }
                        if(entity != null && entity != ''){
                            invoiceSubList.setSublistValue({
                                id: 'entity',
                                line: i,
                                value: entity
                            });
                        }
                        if(department != '' && department != null){
                            invoiceSubList.setSublistValue({
                                id: 'sub_list_2',
                                line: i,
                                value: department
                            });
                        }
                        invoiceSubList.setSublistValue({
                            id: 'sub_list_3',
                            line: i,
                            value: amountremaining
                        });
                        invoiceSubList.setSublistValue({
                            id: 'sub_list_8',
                            line: i,
                            value: acc
                        });
                        invoiceSubList.setSublistValue({
                            id: 'sub_list_9',
                            line: i,
                            value: taxco
                        });
                        invoiceSubList.setSublistValue({
                            id: 'sub_list_10',
                            line: i,
                            value: taxCaSetting
                        });
                        i++;
                    }
                    return true;
                });
                applicable_amount.defaultValue = format.format({
                    value: applicableamount,
                    type: format.Type.INTEGER
                });
                form.clientScriptFileId = clientScriptFileId;
                context.response.writePage(form);
            }else{//POST
                var serverRequest = context.request;
                var lines = serverRequest.getLineCount({ group: "invoice_sub_list" });
                var  array = [];
                for(var i = 0; i < lines; i++){
                    var id = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'id',
                        line: i
                    });
                    var check = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_check',
                        line: i
                    });
                    var entity = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'entity',
                        line: i
                    });
                    var applied = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_4',
                        line: i
                    });
                    var adjustment = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_5',
                        line: i
                    });
                    var check_2 = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_6',
                        line: i
                    });
                    var account = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_8',
                        line: i
                    });
                    var taxco = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_9',
                        line: i
                    });
                    var taxCaSetting = serverRequest.getSublistValue({
                        group: 'invoice_sub_list',
                        name: 'sub_list_10',
                        line: i
                    });
                    var jsonSave = {
                        "id":id,
                        "check":check,
                        "entity":entity,
                        "applied":applied,
                        "adjustment":adjustment,
                        "check_2":check_2,
                        "account":account,
                        "taxco":taxco,
                        "taxCaSetting":taxCaSetting
                    };
                    array.push(jsonSave);
                }

                var payment_id = serverRequest.parameters.payment_id;
                var fee = serverRequest.parameters.fee;
                var calculation_error = serverRequest.parameters.calculation_error;
                var objRecord = record.load({
                    type: 'customrecord_sii_custpayment',
                    id: payment_id
                });
                var saving = objRecord.getValue({
                    fieldId: 'custrecord_sii_custpayment_saving'
                });
                if(array.length != 0){
                    if(saving != '' && saving != null){
                        saving = JSON.parse(saving);
                        saving.invoice = array;
                    }else{
                        saving = {
                            "invoice": array
                        };
                    }
                }
                saving.feeValue = fee;
                saving.calculationValue = calculation_error;
                var customer = serverRequest.parameters.customer;
                record.submitFields({
                    type: 'customrecord_sii_custpayment',
                    id: payment_id,
                    values: {
                        custrecord_sii_custpayment_client: customer,
                        custrecord_sii_custpayment_saving: JSON.stringify(saving)
                    }
                });
              // 合計を入金管理票「入金額」にセット
              var paymentamo = serverRequest.parameters.total_text;
              paymentamo = getInt(paymentamo);
              setPaymentAmount(payment_id, paymentamo);

                var head_id = serverRequest.parameters.head_id;
                redirect.toSuitelet({
                    scriptId: 'customscript_sii_sl_paymentmanagement' ,
                    deploymentId: 'customdeploy_sii_sl_paymentmanagement',
                    parameters: {
                      'custscript_custpayment_head_id': head_id
                    }
                });
            }
        }catch(e){
            log.error({
                title: e.name,
                details: e.message
            });
        }
    }

    function getInvoiceList(){
        var mysearch = search.load({
            id: 'customsearch_custpayment_invoice_detail'
        });
        var resultSet = mysearch.run();
        return( resultSet );
    }

    function getNowDateJP(){
        var stNow = new Date();
        stNow.setMilliseconds((3600000*9));
        var stYear = stNow.getUTCFullYear();
        var stMonth = stNow.getUTCMonth();
        var stDate = stNow.getUTCDate();
        stNow = new Date(stYear,stMonth,stDate);
        return stNow;
    }

    function isEmpty(stValue) {
        if ((stValue == null) || (stValue == '') || (stValue == undefined)) {
            return true;
        } else {
            return false;
        }
    }

  /**
   *合計を入金管理票「入金額」にセット
   * @param paymentListDetailId
   * @param payment_summary
   */
  function setPaymentAmount(paymentListDetailId, payment_summary) {
    var id = record.submitFields({
      type: 'customrecord_sii_custpayment',
      id: paymentListDetailId,
      values: {
        custrecord_sii_custpayment_paymentamo: payment_summary
      }
    });
  }

  /**
   * 123,456,789 -> 123456789
   * @param stringNumber
   * @returns {number | *}
   */
  function getInt(stringNumber){
    stringNumber = stringNumber.split(",");
    var stringtotal = '';
    stringNumber.forEach(function(item, index){
      stringtotal = stringtotal+item;
    });
    stringNumber = parseInt(stringtotal);
    return stringNumber;
  }

    return {
        onRequest: onRequest
    };
    
});

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget','N/url','N/runtime','N/record', 'N/redirect', 'N/search'],

function(serverWidget,url,runtime,record, redirect, search) {

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
    	try{
    		if (scriptContext.type === scriptContext.UserEventType.EDIT){
    		    var currentRecord = scriptContext.newRecord;
    		    //log.debug('Record: ' + currentRecord.id);
    			redirect.toSuitelet({
    				scriptId: 'customscript_sii_sl_paymentmanagement' ,
    				deploymentId: 'customdeploy_sii_sl_paymentmanagement',
    				parameters: {'custscript_custpayment_head_id': currentRecord.id}
    			});
    		}
    	}catch(e){
    		log.error('UE: ' + e.name);
    	}
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {
        try{
            if (scriptContext.type === scriptContext.UserEventType.CREATE){
                var currentRecord = scriptContext.newRecord;
                var customerArray = getCustomer()
                var numLines = currentRecord.getLineCount({
                    sublistId: 'recmachcustrecord_sii_custpayment_h_id'
                });
                for(var i = 0; i < numLines; i++){
                    var bank = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                        fieldId: 'custrecord_sii_custpayment_bank',
                        line: i
                    });
                    bank = bank.replace(/\s/g, '');
                    bank = convertKanaToOneByte(bank);
                    var branchname = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                        fieldId: 'custrecord_sii_custpayment_branchoff',
                        line: i
                    });
                    branchname = branchname.replace(/\s/g, '');
                    branchname = convertKanaToOneByte(branchname);
                    var request = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                        fieldId: 'custrecord_sii_custpayment_request',
                        line: i
                    });
                    request = request.replace(/\s/g, '');
                    request = convertKanaToOneByte(request);
                    for(var m =0; m < customerArray.length; m++){
                        var custbankname = customerArray[m].getValue({name: 'custentity_sii_custpayment_bankname'});
                        custbankname = custbankname.replace(/\s/g, '');
                        custbankname = convertKanaToOneByte(custbankname);
                        var custbranchname = customerArray[m].getValue({name: 'custentity_sii_custpayment_branchname'});
                        custbranchname = custbranchname.replace(/\s/g, '');
                        custbranchname = convertKanaToOneByte(custbranchname);
                        var custclientname = customerArray[m].getValue({name: 'custentity_sii_custpayment_clientname'});
                        custclientname = custclientname.replace(/\s/g, '');
                        custclientname = convertKanaToOneByte(custclientname);
                        var entityid = customerArray[m].getValue({name: 'entityid'});
                        if(custbankname == bank && custbranchname == branchname && custclientname == request ){
                            currentRecord.setSublistValue({
                                sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                                fieldId: 'custrecord_sii_custpayment_customerno',
                                value: entityid,
                                line: i
                            });
                            currentRecord.setSublistValue({
                                sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                                fieldId: 'custrecord_sii_custpayment_client',
                                value: customerArray[m].id,
                                line: i
                            });
                            currentRecord.setSublistValue({
                                sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                                fieldId: 'custrecord_sii_custpayment_client_half',
                                value: customerArray[m].getValue({name: 'custentity_hankakukana_name'}),
                                line: i
                            });
                            break;
                        } 
                    }
                }
                var scriptObj = runtime.getCurrentScript();
                log.debug("Remaining governance units: " + scriptObj.getRemainingUsage());
            }
        }catch(e){
            log.error('UE: ' + e);
        }
    }
    
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {
 
    }

    function getCustomer(){
        var SLICE_LIMIT = 1000;
        var myCustomerListSearch = search.create({
            type: search.Type.CUSTOMER,
            columns: [{
                name: 'entityid'
            }, {
                name: 'custentity_sii_custpayment_bankname'
            }, {
                name: 'custentity_sii_custpayment_branchname'
            }, {
                name: 'custentity_sii_custpayment_clientname'
            }, {
                name: 'custentity_hankakukana_name'
            }]
        });
        var resultSet = myCustomerListSearch.run();
        var customerArray = resultSet.getRange({
            start: 0,
            end: SLICE_LIMIT
        });
        return( customerArray );
    }

    function createKanaMap(properties, values) {
        var kanaMap = {};
        // 念のため文字数が同じかどうかをチェックする(ちゃんとマッピングできるか)
        if(properties.length === values.length) {
            for(var i=0, len=properties.length; i<len; i++) {
                var property= properties.charCodeAt(i),
                    value = values.charCodeAt(i);
                kanaMap[property] = value;
            }
        }
        return kanaMap;
    };

    // 全角から半角への変換用マップ
    var m = createKanaMap(
        'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォッャュョ',
        'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｯｬｭｮ'
    );
    // 半角から全角への変換用マップ
    /*var mm = createKanaMap(
        'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｯｬｭｮ',
        'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォッャュョ'
    );*/

    // 全角から半角への変換用マップ
    var g = createKanaMap(
        'ガギグゲゴザジズゼゾダヂヅデドバビブベボ',
        'ｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾊﾋﾌﾍﾎ'
    );
    // 半角から全角への変換用マップ
    /*var gg = createKanaMap(
        'ｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾊﾋﾌﾍﾎ',
        'ガギグゲゴザジズゼゾダヂヅデドバビブベボ'
    );*/
      
    // 全角から半角への変換用マップ
    var p = createKanaMap(
        'パピプペポ',
        'ﾊﾋﾌﾍﾎ'
    );
    // 半角から全角への変換用マップ
    /*var pp = createKanaMap(
        'ﾊﾋﾌﾍﾎ',
        'パピプペポ'
    );*/

    var gMark = 'ﾞ'.charCodeAt(0);
    var pMark = 'ﾟ'.charCodeAt(0);

    function convertKanaToOneByte(str){
        for(var i=0, len=str.length; i<len; i++) {
            if(g.hasOwnProperty(str.charCodeAt(i)) || p.hasOwnProperty(str.charCodeAt(i))) {
                if(g[str.charCodeAt(i)]) {
                    str = str.replace(str[i], String.fromCharCode(g[str.charCodeAt(i)])+String.fromCharCode(gMark));
                }else if(p[str.charCodeAt(i)]) {
                    str = str.replace(str[i], String.fromCharCode(p[str.charCodeAt(i)])+String.fromCharCode(pMark));
                }else {
                    break;
                }
                i++;
                len = str.length;
            }else {
                if(m[str.charCodeAt(i)]) {
                    str = str.replace(str[i], String.fromCharCode(m[str.charCodeAt(i)]));
                }
            }
        }
        return str;
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };

});

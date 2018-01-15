/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 *
 * 入金ヘッダーの画面ロードの処理
 *
 * Version    Date            Author           Remarks
 * 1.00       2018/01/09      Astop            Initial
 *
 */
define(['N/ui/serverWidget','N/url','N/runtime','N/record', 'N/redirect', 'N/search', 'N/task'],

function(serverWidget,url,runtime,record, redirect, search, task) {

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
        if (scriptContext.type === scriptContext.UserEventType.VIEW){
        	//ステータスに関係なく「更新ボタンを表示する」
        	var form = scriptContext.form;
            form.addButton({
              id: 'custpage_refresh',
              label: '更新',
              functionName: 'btnUpdateButton();'
            });
            
          var cs_file_id = runtime.getCurrentScript().getParameter("custscript_headview_cs_file");
          var currentRecord = scriptContext.newRecord;
          var form = scriptContext.form;
          var status = currentRecord.getValue('custrecord_sii_custpayment_status');
          form.clientScriptFileId = cs_file_id;
        }
    		if (scriptContext.type === scriptContext.UserEventType.EDIT){
          var currentRecord = scriptContext.newRecord;
          /**
           * //【ステータス変化】
           * 1.入金データ取込済
           →開始状態。入金管理票に移動可能。
           2.自動消込実行中
           →「実行」ボタン押下時。入金管理票に移動不可能。
           3.自動消込完了
           →仕訳、入金票生成完了時。入金管理票に移動不可能。
           4.自動消込エラー
           →仕訳生成及び入金票生成失敗時。入金管理票に移動可能。
           */
          var status = currentRecord.getValue('custrecord_sii_custpayment_status');
          if(status === '1' || status === '5'){
            redirect.toSuitelet({
              scriptId: 'customscript_sii_sl_paymentmanagement' ,
              deploymentId: 'customdeploy_sii_sl_paymentmanagement',
              parameters: {'custscript_custpayment_head_id': currentRecord.id}
            });
          }

    		  if(status === '3' || status === '4'){
            redirect.toRecord({
              type : 'customrecord_sii_custpayment_h',
              id : currentRecord.id
            });
          }
    		    //log.debug('Record: ' + currentRecord.id);
    		}
            /*if(scriptContext.type === scriptContext.UserEventType.VIEW){
                var form = scriptContext.form;
                var currentRecord = scriptContext.newRecord;
                form.addButton({
                    id : 'custpage_print_receipt',
                    label : '実行',
                    functionName: "window.history.go(-1);"
                });
            }*/
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
                var customerArray = getCustomer();
                var numLines = currentRecord.getLineCount({
                    sublistId: 'recmachcustrecord_sii_custpayment_h_id'
                });
                for(var i = 0; i < numLines; i++){
                    var client_half = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                        fieldId: 'custrecord_sii_custpayment_client_half',
                        line: i
                    });
                    client_half = client_half.replace(/\s/g, '');
                    client_half = convertKanaToOneByte(client_half);
                    for(var m =0; m < customerArray.length; m++){
                        var hankakukana_name = customerArray[m].getValue({name: 'custentity_hankakukana_name'});
                        hankakukana_name = hankakukana_name.replace(/\s/g, '');
                        hankakukana_name = convertKanaToOneByte(hankakukana_name);
                        var entityid = customerArray[m].getValue({name: 'entityid'});
                        if(hankakukana_name ==  client_half){
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
                            break;
                        }
                    }
                }
                var scriptObj = runtime.getCurrentScript();
                log.audit("Remaining governance units: " + scriptObj.getRemainingUsage());
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
      try{
        var currentRecord = scriptContext.newRecord;
        var status = currentRecord.getValue('custrecord_sii_custpayment_status');
        log.audit({
          title: 'afterSubmit audit',
          details: status
        });
        if(status === '1' || status === '5'){
        }
        if(status === '3'){
          //Scheduled Script call
          var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
          scriptTask.scriptId = 'customscript_sii_ss_create_journal_custp';
          scriptTask.deploymentId = 'customdeploy_sii_ss_create_journal_custp';
          scriptTask.params = {custscripthead_id: currentRecord.id};
          var scriptTaskId = scriptTask.submit();
        }
      }catch (e){
        log.error('UE afterSubmit :' + e);
      }
    }

    function getCustomer(){
        var SLICE_LIMIT = 1000;
        var myCustomerListSearch = search.create({
            type: search.Type.CUSTOMER,
            columns: [{
                name: 'entityid'
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

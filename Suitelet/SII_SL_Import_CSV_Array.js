/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/ui/serverWidget', 'N/log', 'N/https', 'N/url', 'N/record', 'N/runtime', 'N/format', 'N/redirect', 'N/search'], function(serverWidget, log, https, url, record, runtime, format, redirect, search) {
	function onRequest(context) {
		try{
			if (context.request.method === 'GET') {
				var scriptObj = runtime.getCurrentScript();
			  	var clientScriptFileId = scriptObj.getParameter({name: 'custscript_client_script_fileid'})
				var form = serverWidget.createForm({
				    title : '入金データ取込'
			    });
			    var field = form.addField({
				    id: 'custom_file',
				    type: serverWidget.FieldType.FILE,
				    label: 'ファイル選択'
			    });
			    form.clientScriptFileId = clientScriptFileId;
			    field.layoutType = serverWidget.FieldLayoutType.NORMAL;
			    field.updateBreakType({breakType : serverWidget.FieldBreakType.STARTCOL});
			    form.addSubmitButton({label: '実行'});
			    context.response.writePage(form);
			}
			else if (context.request.method === 'POST') {
			  	var scriptObj = runtime.getCurrentScript();
			  	var csvfolder = scriptObj.getParameter({name: 'custscript_sii_csvfolder_array'})
				var fileObj = context.request.files.custom_file;
				fileObj.folder = csvfolder;
				var arrData = CSVToArray(fileObj.getContents());
				if(checkCSVData(arrData)){
				  	var html = '<SCRIPT language="JavaScript" type="text/javascript">';
	                html += "function bindEvent(element, type, handler) {if(element.addEventListener) {element.addEventListener(type, handler, false);} else {element.attachEvent('on'+type, handler);}} "; 
	                html += 'bindEvent(window, "load", function(){'; 
	                html += 'if (confirm("CSVデータが正しくありません。") == true) {';
	                html += 'window.history.back()';
	                html += '}';
	                html += 'else{'
	                html += 'window.history.back()'
	                html += '}';
	                html += '});'; 
	                html += '</SCRIPT>';
	                var form = serverWidget.createForm({
	                	title : '入金データ取込'
				    });
				    var field1 = form.addField({
				    	id : 'fieldid',
				    	type : serverWidget.FieldType.INLINEHTML,
				    	label : 'Text'
				    });
				    field1.defaultValue = html;
				    context.response.writePage(form);
				}else if(checkTotal(arrData)){
				    var html = '<SCRIPT language="JavaScript" type="text/javascript">';
	                html += "function bindEvent(element, type, handler) {if(element.addEventListener) {element.addEventListener(type, handler, false);} else {element.attachEvent('on'+type, handler);}} "; 
	                html += 'bindEvent(window, "load", function(){'; 
	                html += 'if (confirm("明細行とトレーラ行の合計金額が正しくありません。") == true) {';
	                html += 'window.history.back()';
	                html += '}';
	                html += 'else{'
	                html += 'window.history.back()'
	                html += '}';
	                html += '});'; 
	                html += '</SCRIPT>';
	                var form = serverWidget.createForm({
	                	title : '入金データ取込'
	                });
				    var field1 = form.addField({
				    	id : 'fieldid',
				    	type : serverWidget.FieldType.INLINEHTML,
				    	label : 'Text'
				    });
				    field1.defaultValue = html;
				    context.response.writePage(form);
				}else{
				    var fileId = fileObj.save();
				    var recCustpaymentHeadId = createCustomRecord(arrData,fileObj.name);
					redirect.toSuitelet({
						scriptId: 'customscript_sii_sl_paymentmanagement' ,
						deploymentId: 'customdeploy_sii_sl_paymentmanagement',
						parameters: {'custscript_custpayment_head_id': recCustpaymentHeadId}
					});
					/*redirect.toRecord({
						type : 'customrecord_sii_custpayment_h',
					  	id : recCustpaymentHeadId
					});*/
				}
				var scriptObj = runtime.getCurrentScript();
				log.debug("Remaining governance units: " + scriptObj.getRemainingUsage());  
			}
		}catch(exception){
			log.error({
				title: 'Error',
				details: exception
			});
		}
	}

    function checkCSVData(arrData){
   	    if(arrData[0][0] != 1 || arrData[arrData.length - 2][0] != 9){
   	    	return(true);
   	    }else{
   	    	return(false);
   	    }
    }

    function checkTotal(arrData){
   	    var sum_amounts = 0;
	    var total_transfer_amount = 0;
	    for(i = 0 ; i< arrData.length; i++){
	  	    if(arrData[i][0] == 2){
	  		    sum_amounts += format.parse({value: arrData[i][4],type: format.Type.INTEGER});
	        }
	  	    if(arrData[i][0] == 8){
	  		    total_transfer_amount = format.parse({value: arrData[i][2],type: format.Type.INTEGER});
	  	    }
	    }
	    if(total_transfer_amount != sum_amounts){
	    	return(true);
	    }else{
	    	return(false);
	    }
    }
	/**
	 * Read data from input and add it to custom record
	 * @param {[array]} arrData [two dimension array of csv data]
	 */
	function createCustomRecord(arrData, filename){
		var recCustpaymentHeadId;
		var userObj = runtime.getCurrentUser();
		var nowDate = new Date();
		var warekiYear = getWarekiYear();
		for (var i = arrData.length-1; i >= 0; i--) {
			if(arrData[i][0] == 8){
				var recCustpaymentHead = record.create({
					type: 'customrecord_sii_custpayment_h'
				});
				recCustpaymentHead.setValue({
					fieldId: 'custrecord_sii_custpayment_importdate',
					value: nowDate
				});
				recCustpaymentHead.setValue({
					fieldId: 'custrecord_sii_custpayment_importnumber',
					value: format.parse({value: arrData[i][1],type: format.Type.INTEGER})
				});
				recCustpaymentHead.setValue({
					fieldId: 'custrecord_sii_custpayment_amountsum',
					value: format.parse({value: arrData[i][2],type: format.Type.INTEGER})
				});
				recCustpaymentHead.setValue({
					fieldId: 'custrecord_sii_custpayment_filename',
					value: filename
				});
				recCustpaymentHead.setValue({
					fieldId: 'custrecord_sii_custpayment_importperson',
					value: userObj.id
				});
				recCustpaymentHead.setValue({
					fieldId: 'custrecord_sii_custpayment_status',
					value: 1
				});
				break;
			}
		}
		paymentArray = [];
		for (var i = 0; i < arrData.length-1; i++) {
			if(arrData[i][0] == 2){
				var k = 0;
				for(var j =0; j < paymentArray.length; j++){
					if(arrData[i][8] == paymentArray[j][8] && arrData[i][9] == paymentArray[j][9] && arrData[i][7] == paymentArray[j][7]){
						paymentArray[j][4] = parseFloat(paymentArray[j][4])+parseFloat(arrData[i][4]);
						k = 1;
						break;
					}
				}
				if(k == 0){
					paymentArray.push(arrData[i]);
				}
			}
		}
		var j = 0;
		for(var i = 0; i < paymentArray.length; i++){
			var date = new Date(coventDate((paymentArray[i][2]),warekiYear));
			recCustpaymentHead.setSublistValue({
				sublistId: 'recmachcustrecord_sii_custpayment_h_id',
				fieldId: 'custrecord_sii_custpayment_depositnum',
				line: j,
				value: paymentArray[i][1]
			});
			recCustpaymentHead.setSublistValue({
				sublistId: 'recmachcustrecord_sii_custpayment_h_id',
				fieldId: 'custrecord_sii_custpayment_paymentdate',
				value: date,
				line: j
			});
			recCustpaymentHead.setSublistValue({
				sublistId: 'recmachcustrecord_sii_custpayment_h_id',
				fieldId: 'custrecord_sii_custpayment_bank',
				value: paymentArray[i][8],
				line: j
			});
			recCustpaymentHead.setSublistValue({
				sublistId: 'recmachcustrecord_sii_custpayment_h_id',
				fieldId: 'custrecord_sii_custpayment_branchoff',
				value: paymentArray[i][9],
				line: j
			});
			recCustpaymentHead.setSublistValue({
				sublistId: 'recmachcustrecord_sii_custpayment_h_id',
				fieldId: 'custrecord_sii_custpayment_request',
				value: paymentArray[i][7],
				line: j
			});
			recCustpaymentHead.setSublistValue({
				sublistId: 'recmachcustrecord_sii_custpayment_h_id',
				fieldId: 'custrecord_sii_custpayment_paymentamo',
				value: format.parse({value: paymentArray[i][4],type: format.Type.INTEGER}),
				line: j
			});
		    j++;
		}
		if(j !== 0){
			recCustpaymentHead.setValue({
			    fieldId: 'custrecord_sii_custpayment_status',
			    value: 1
			});
		}
		recCustpaymentHeadId = recCustpaymentHead.save();
		return(recCustpaymentHeadId);
	}
	function coventDate(strDate, warekiYear){
		var date = parseFloat(strDate);
		var yearString = warekiYear*10000+date
		var year = yearString.toString().slice(0,4);
		var month = yearString.toString().slice(4,6);
		var day = yearString.toString().slice(6);
		var parsedDateStringAsRawDateObject = format.parse({
			value: month+'/'+day+'/'+year,
			type: format.Type.DATE
		});
		return( parsedDateStringAsRawDateObject );
	}

	function getWarekiYear(){
		var yearSearch = search.create({
			type: 'customlist_sii_wareki_year',
			columns: [{
				name: 'name'
			}]
		});
		var rs = yearSearch.run();
		var warekiYear = rs.getRange({
			start: 0,
			end: 1
		})[0].getValue({
			name: 'name'
		});
		return( warekiYear );
	}

	/**
	 * Input a string of csv data and parse it and return to two dimension array
	 * @param {[string]} strData      [csv string data]
	 * @param {[string]} strDelimiter [split method charactor]
	 */
	function CSVToArray( strData, strDelimiter ){
	  // Check to see if the delimiter is defined. If not,
	  // then default to comma.
	  strDelimiter = (strDelimiter || ",");

	  // Create a regular expression to parse the CSV values.
	  var objPattern = new RegExp(
	      (
	          // Delimiters.
	          "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

	          // Quoted fields.
	          "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

	          // Standard fields.
	          "([^\"\\" + strDelimiter + "\\r\\n]*))"
	      ),
	      "gi"
	      );


	  // Create an array to hold our data. Give the array
	  // a default empty first row.
	  var arrData = [[]];

	  // Create an array to hold our individual pattern
	  // matching groups.
	  var arrMatches = null;


	  // Keep looping over the regular expression matches
	  // until we can no longer find a match.
	  while (arrMatches = objPattern.exec( strData )){

	      // Get the delimiter that was found.
	      var strMatchedDelimiter = arrMatches[ 1 ];

	      // Check to see if the given delimiter has a length
	      // (is not the start of string) and if it matches
	      // field delimiter. If id does not, then we know
	      // that this delimiter is a row delimiter.
	      if (
	          strMatchedDelimiter.length &&
	          strMatchedDelimiter !== strDelimiter
	          ){

	          // Since we have reached a new row of data,
	          // add an empty row to our data array.
	            arrData.push( [] );
	        }
	        var strMatchedValue;
	      // Now that we have our delimiter out of the way,
	      // let's check to see which kind of value we
	      // captured (quoted or unquoted).
	        if (arrMatches[ 2 ]){
	          // We found a quoted value. When we capture
	          // this value, unescape any double quotes.
	            strMatchedValue = arrMatches[ 2 ].replace(
	            	new RegExp( "\"\"", "g" ),
	            	"\""
	            );
	        }else {
	          // We found a non-quoted value.
	            strMatchedValue = arrMatches[ 3 ];
	        }
	      // Now that we have our value string, let's add
	      // it to the data array.
	        arrData[ arrData.length - 1 ].push( strMatchedValue );
	    }

	  // Return the parsed data.
	    return( arrData );
	}

   return {
   	    onRequest: onRequest
   };
});
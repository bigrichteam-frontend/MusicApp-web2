//解决编辑器弹出层文本框不能输入的问题
$('#articleModal').off('shown.bs.modal').on('shown.bs.modal', function (e) {
    $(document).off('focusin.modal');
});

$(function () {
    //隐藏错误提示框
    $('.alert-danger').css("display", "none");

    initFlatPickr();

    $('#articleModal').modal('hide');

    $("#jqGrid").jqGrid({
        url: 'http://localhost:8888/song/SongList',
        datatype: "json",
        colModel: [
            {label: 'id', name: 'id', index: 'id', width: 50, key: true, hidden: true},
            {label: '歌曲名', name: 'name', index: 'name', width: 80},
            {label: '时长', name: 'musicTime', index: 'musicTime', width: 100},
            {label: '热度', name: 'hot', index: 'hot', width: 80},
            {label: '图片', name: 'musicHeadUrl', index: 'musicHeadUrl', sortable: false, width: 100, formatter: imgFormatter},
            {label: '发布时间', name: 'songLongTime', index: 'songLongTime', width: 80},

        ],
        height: 560,
        rowNum: 10,
        rowList: [10, 20, 50],
        styleUI: 'Bootstrap',
        loadtext: '信息读取中...',
        rownumbers: false,
        rownumWidth: 20,
        autowidth: true,
        multiselect: true,
        pager: "#jqGridPager",
        jsonReader: {
            root: "items",
            page: "currPage",
            total: "totalPage",
            records: "total"

        },
        prmNames: {
            page: "page",
            rows: "limit",
            order: "order",
        },
        gridComplete: function () {
            //隐藏grid底部滚动条
            $("#jqGrid").closest(".ui-jqgrid-bdiv").css({"overflow-x": "hidden"});
        }
    });


    new AjaxUpload('#importV1Button', {
        action: 'users/importV1',
        name: 'file',
        autoSubmit: true,
        responseType: "json",
        onSubmit: function (file, extension) {
            if (!(extension && /^(xlsx)$/.test(extension.toLowerCase()))) {
                swal('只支持xlsx格式的文件！', {
                    icon: "error",
                });
                return false;
            }
        },
        onComplete: function (file, r) {
            if (r.resultCode == 200) {
                swal("成功导入" + r.data + "条记录！", {
                    icon: "success",
                });
                reload();
                return false;
            } else {
                swal(r.message, {
                    icon: "error",
                });
            }
        }
    });

});

function imgFormatter(cellvalue) {
    return "<a href='" + cellvalue + "'> <img src='" + cellvalue + "' height=\"120\" width=\"135\" alt='path'/></a>";
}
/**
 * 初始化时间选择框
 */
function initFlatPickr() {
    $('.startTime').flatpickr();
    $('.endTime').flatpickr();
    //创建一个当前日期对象
    var now = new Date();
    //格式化日，如果小于9，前面补0
    var day = ("0" + now.getDate()).slice(-2);
    //格式化月，如果小于9，前面补0
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    //小时
    var hour = ("0" + now.getHours()).slice(-2);
    //分钟
    var minute = ("0" + now.getMinutes()).slice(-2);
    //秒
    var seconds = ("0" + now.getSeconds()).slice(-2);
    //拼装完整日期格式
    var todayTime = now.getFullYear() + "-" + (month) + "-" + (day) + " 00:00:00";
    var nowTime = now.getFullYear() + "-" + (month) + "-" + (day) + " " + hour + ":" + minute + ":" + seconds;
    $('.startTime').val(todayTime);
    $('.endTime').val(nowTime);
}

//绑定modal上的保存按钮
$('#saveButton').click(function () {
    //验证数据
    if (validObject()) {
        //一切正常后发送网络请求
        //ajax
        var id = $("#songId").val();
        console.log("id:"+id);
        var name = $("#name").val();
        var time =  $('#musicTime').val();
        var data = {"name": name, "time": time};
        var url = 'http://localhost:8888/song/addSong';
        //id>0表示编辑操作
        if (id > 0) {
            var data = {"id": id, "name": name, "musicTime": time};
            url = 'http://localhost:8888/song/updateSong';
        }
        $.ajax({
            type: 'POST',//方法类型
            //dataType: "json",//预期服务器返回的数据类型
            url: url,//url
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            success: function (result) {
                if (result == "成功") {
                    $('#songModal').modal('hide');
                    swal("保存成功", {
                        icon: "success",
                    });
                    reload();
                }else{
                    $('#songModal').modal('hide');
                    swal("保存失败", {
                        icon: "error",
                    });
                }
                ;
            },
            error: function () {
                swal("操作失败", {
                    icon: "error",
                });
            }
        });

    }
});


function articleAdd() {
    reset();
    $('.modal-title').html('添加');
    $('#articleModal').modal('show');
}

function articleEdit() {
    reset();
    $('.modal-title').html('编辑');

    var id = getSelectedRow();
    if (id == null) {
        return;
    }
    //请求数据
    $.get("http://localhost:8888/song/selectById?id=" + id, function (r) {
        if (r != 400 ) {
            //填充数据至modal
            $('#songId').val(r.id);
            $('#name').val(r.name);
            $('#musicTime').val(r.musicTime);
        }
    });
    //显示modal
    $('#songModal').modal('show');
}

/**
 * 搜索功能
 */
function search() {
    //标题关键字
    var keyword = $('#keyword').val();
    if (!validLength(keyword, 20)) {
        swal("搜索字段长度过大!", {
            icon: "error",
        });
        return false;
    }

    //传入查询条件参数$("#jqGrid").jqGrid("setGridParam", {postData: searchData});
    $("#jqGrid").jqGrid("setGridParam");
    //点击搜索按钮默认都从第一页开始
    $("#jqGrid").jqGrid("setGridParam", {page: 1});
    //提交post并刷新表格
    $("#jqGrid").jqGrid("setGridParam", {url: 'http://localhost:8888/song/selectByName?name='+keyword}).trigger("reloadGrid");

}

/**
 * 数据验证
 */
function validObject() {
    var name = $('#name').val();
    if (isNull(name)) {
        showErrorInfo("标题不能为空!");
        return false;
    }
    if (!validLength(name, 120)) {
        showErrorInfo("标题字符不能大于120!");
        return false;
    }
    var musicTime = $('#musicTime').val();
    if (isNull(musicTime)) {
        showErrorInfo("时间不能为空!");
        return false;
    }
    if (!validLength(musicTime, 10)) {
        showErrorInfo("时间不能太长!");
        return false;
    }

    return true;
}

/**
 * 重置
 */
function reset() {
    //隐藏错误提示框
    $('.alert-danger').css("display", "none");
    //清空数据
    $('#articleId').val(0);
    $('#keyword').val('');
    $('#articleName').val('');
    $('#articleAuthor').val('');
    $('#ariticleContent').val('');
}

/**
 * whg写
 */
function deleteSong() {
    var ids = getSelectedRows();
    if (ids == null) {
        return;
    }
    $.ajax({
        type: "GET",
        url: "http://localhost:8888/song/delete?id="+ids,
        contentType: "application/json",
        success: function (r) {
            if (r == "删除成功") {
                swal("删除成功", {
                    icon: "success",
                });
                $("#jqGrid").trigger("reloadGrid");
            } else {
                swal(r.message, {
                    icon: "error",
                });
            }
        }
    });
}



/**
 * jqGrid重新加载
 */
function reload() {
    reset();
    initFlatPickr();
    var page = $("#jqGrid").jqGrid('getGridParam', 'page');
    $("#jqGrid").jqGrid('setGridParam', {
        page: page
    }).trigger("reloadGrid");
}
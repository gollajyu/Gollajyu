import React, { useState, useEffect } from "react";
import API_URL from "../../stores/apiURL";
import axios from "axios";
import useAuthStore from "../../stores/userState";
import useModalStore from "../../stores/modalState";

const VoteProduct = ({ voteReqDto, setVoteReqDto }) => {
  // 제목 state
  const [title, setTitle] = useState("");
  // 설명 state 추가
  const [description, setDescription] = useState("");
  // 카테고리 상태 변수 추가
  const [category, setCategory] = useState("");
  // 투표 항목 state
  const [items, setItems] = useState([{}, {}]);
  // 모달창 닫기
  const setVoteProductCreateModalClose = useModalStore(
    (state) => state.setVoteProductCreateModalClose
  );
  // 사용자 ID를 저장할 state 변수 추가
  const user = useAuthStore((state) => state.user);
  // 사진 첨부 미리보기 관련 state 추가
  const [previewImages, setPreviewImages] = useState([]);

  const createVote = useAuthStore((state) => state.createVote);

  const handleImageUpload = (event, index) => {
    const newPreviewImages = [...previewImages];
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      newPreviewImages[index] = URL.createObjectURL(file);
      setPreviewImages(newPreviewImages);

      // items 배열에도 이미지 정보 추가
      const updatedItems = [...items];
      if (!updatedItems[index]) {
        updatedItems[index] = { voteItemImg: file, voteItemDesc: "", price: 0 };
      } else {
        updatedItems[index] = {
          ...updatedItems[index],
          voteItemImg: file, // 이미지 파일 추가
        };
      }
      setItems(updatedItems);

      // voteReqDto에 이미지 정보 추가
      const newVoteItemList = voteReqDto.voteItemList.slice();
      newVoteItemList[index] = {
        ...newVoteItemList[index],
        voteItemImg: file,
      };
      setVoteReqDto({
        ...voteReqDto,
        voteItemList: newVoteItemList,
      });
    } else {
      newPreviewImages[index] = null;
      setPreviewImages(newPreviewImages);
    }
  };

  const handleInputChange = (e, index, field) => {
    const updatedItems = [...items];
    const value =
      field === "price" ? parseFloat(e.target.value) || 0 : e.target.value;
    if (updatedItems[index]) {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    } else {
      updatedItems[index] = { voteItemImg: null, [field]: value };
    }
    setItems(updatedItems);
  };

  // 사진 첨부 기능
  const handleImageChange = (e, index) => {
    const newImages = images.slice();
    newImages[index] = e.target.files[0];
    setImages(newImages);

    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImages([...previewImages, reader.result]);
      };
      reader.readAsDataURL(e.target.files[0]);
    } else {
      // 기존 이미지 삭제
      const voteItemList = [...voteReqDto.voteItemList];
      voteItemList[index].voteItemImg = null;
      setVoteReqDto({
        ...voteReqDto,
        voteItemList,
      });
      setPreviewImages([
        ...previewImages.slice(0, index),
        ...previewImages.slice(index + 1),
      ]);
    }
  };

  // 항목 추가 기능
  const handleAddItem = () => {
    if (items.length < 4) {
      setItems([...items, {}]);
      // voteReqDto 객체 업데이트
      const voteItemList = [...voteReqDto.voteItemList];
      voteItemList.push({
        voteItemImg: "",
        voteItemDesc: null,
        price: 0,
      });
      setVoteReqDto({
        ...voteReqDto,
        voteItemList,
      });
    } else {
      alert("최대 4개의 투표 항목까지만 추가할 수 있습니다.");
    }
  };

  // 제출 내용 확인
  const handleSubmit = (event) => {
    event.preventDefault();
    // 이미지 갯수와 제목, 카테고리 확인
    const imageCount = items.filter(
      (item) => item.voteItemImg !== null && item.voteItemImg !== ""
    ).length;
    if (title === "") {
      alert("제목을 입력해주세요!");
      return;
    }
    if (category === "") {
      alert("카테고리를 선택해주세요!");
      return;
    }
    if (imageCount < 2) {
      alert("최소 2개 이상의 사진을 첨부해주세요!");
      return;
    }

    // 데이터 전송
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("categoryId", category);
    formData.append("memberEmail", user.email);

    console.log("test2");
    console.log(items);

    items.forEach((item, index) => {
      if (item.voteItemImg) {
        formData.append(`voteItemList[${index}].voteItemImg`, item.voteItemImg);
      }
      formData.append(
        `voteItemList[${index}].voteItemDesc`,
        item.voteItemDesc || ""
      );
      formData.append(`voteItemList[${index}].price`, item.price.toString());
    });

    console.log("formData:", formData);
    const formDataObject = Object.fromEntries(formData);
    console.log("formDataObject:", formDataObject);

    axios
      .post(`${API_URL}/votes`, formData, {
        // data: formDataObject,
        headers: {
          "Content-Type": "multipart/form-data",
          // 'Authorization': `Bearer ${user.accessToken}`
        },
      })
      .then((response) => {
        console.log(response);
        // API 호출 성공
        if (response.status === 200) {
          // 투표 게시 성공
          alert("투표 생성에 성공했쥬!");
          createVote(); // 투표 만들면 10포인트 차감
          setVoteProductCreateModalClose(true); // 모달창 닫기
        } else {
          // API 호출 실패
          alert("투표 생성에 실패했습니다. 다시 시도해주세요.");
          console.error(response.data);
        }
      })
      .catch((error) => {
        // 에러 발생
        console.error(error);
        alert("투표 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
      });
  };

  return (
    <div
      id="outer-layer"
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target.id == "outer-layer") {
          setVoteProductCreateModalClose();
        }
      }}
    >
      <div className="mx-auto max-h-[700px] w-full max-w-[550px] bg-white overflow-y-auto">
        <form className="py-4 px-9" onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="title"
              className="mb-3 block text-base font-medium text-[#FF7F50]"
            >
              제목:
            </label>
            <input
              type="text"
              name="title"
              id="title"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#FF7F50] focus:shadow-md"
            />
          </div>
          <div className="mb-5">
            <label
              htmlFor="category"
              className="mb-3 block text-base font-medium text-[#FF7F50]"
            >
              카테고리:
            </label>
            <select
              name="category"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#FF7F50] focus:shadow-md"
            >
              <option value="">카테고리를 선택하세요</option>
              <option value="1">의류</option>
              <option value="2">가구</option>
              <option value="3">신발</option>
              <option value="4">전자제품</option>
              <option value="5">기타</option>
            </select>
          </div>
          <div className="mb-5">
            <label
              htmlFor="description"
              className="mb-3 block text-base font-medium text-[#FF7F50]"
            >
              투표 내용:
            </label>
            <textarea
              name="description"
              id="description"
              placeholder="투표 내용을 입력하세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#FF7F50] focus:shadow-md"
            />
          </div>

          {/* 투표 항목 추가 부분 */}
          {items.map((item, index) => (
            <div key={index} className="mb-6 pt-4 border-t-2 border-blue-400">
              <label className="mb-5 block text-xl font-semibold text-[#FF7F50]">
                투표 항목 추가
              </label>
              {previewImages[index] && (
                <img
                  src={previewImages[index]}
                  alt={`투표 항목 ${index + 1} 이미지`}
                  className="object-cover max-h-[300px] w-full rounded-lg mb-8"
                />
              )}
              {!previewImages[index] && (
                <div>
                  <input
                    type="file"
                    name={`file-${index}`}
                    id={`file-${index}`}
                    className="sr-only"
                    onChange={(e) => handleImageUpload(e, index)}
                  />
                  <label
                    htmlFor={`file-${index}`}
                    className="relative flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-[#e0e0e0] p-12 text-center"
                  >
                    <div>
                      <span className="mb-2 block text-xl font-semibold text-[#FF7F50]">
                        사진을 첨부해주세요
                      </span>
                    </div>
                  </label>
                </div>
              )}
              <div className="mb-5">
                <label
                  htmlFor={`price-${index}`}
                  className="mb-3 block text-base font-medium text-[#FF7F50]"
                >
                  가격:
                </label>
                <input
                  type="number"
                  name={`price-${index}`}
                  id={`price-${index}`}
                  placeholder="가격을 입력하세요"
                  value={item.price || ""}
                  onChange={(e) => handleInputChange(e, index, "price")}
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#FF7F50] focus:shadow-md"
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor={`content-${index}`}
                  className="mb-3 block text-base font-medium text-[#FF7F50]"
                >
                  내용 설명:
                </label>
                <textarea
                  name={`content-${index}`}
                  id={`content-${index}`}
                  placeholder="내용을 입력하세요"
                  value={item.voteItemDesc || ""}
                  onChange={(e) => handleInputChange(e, index, "voteItemDesc")}
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#FF7F50] focus:shadow-md"
                />
              </div>
            </div>
          ))}

          {/* 투표 항목 추가 버튼 */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full rounded-md bg-[#FF7F50] py-3 px-8 text-center text-base font-semibold text-white outline-none"
            >
              투표 항목 추가하기
            </button>
          </div>
          <div className="flex justify-between">
            <button className="hover:shadow-form w-full rounded-md bg-[#FF7F50] py-3 px-8 text-center text-base font-semibold text-white outline-none mb-3 mr-2">
              투표 올리기
            </button>
            <button className="hover:shadow-form w-full rounded-md bg-[#FF7F50] py-3 px-8 text-center text-base font-semibold text-white outline-none mb-3 mr-2">
              취소하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoteProduct;

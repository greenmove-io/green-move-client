import {
	InputGroup,
	InputRightElement,
	Input,
	IconButton,
	Box,
	Text,
	Flex,
	Spinner,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useRef, useState } from "react";
import { useRouter } from "next/router";
import Fuse from "fuse.js";
import { useFocusWithin } from "@react-aria/interactions";

export default function SearchBarAuto({ suggestions, ...props }) {
	if (!suggestions) suggestions = []; // Error handling

	// Setup fuse search:
	const options = {
		threshold: 0.4,
	};
	const fuse = new Fuse(suggestions, options);

	const router = useRouter();

	// Submit button ref:
	const submitRef = useRef(null);

	// Booleans:
	const [isFocused, setIsFocused] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [isError, setIsError] = useState(false);

	const [suggestionsIndex, setSuggestionsIndex] = useState(-1);
	const [filteredSuggestions, setFilteredSuggestions] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");

	// Focus Within
	let { focusWithinProps } = useFocusWithin({
		onFocusWithin: () => {
			setIsFocused(true);
		},
		onBlurWithin: () => {
			setIsFocused(false);
			setSuggestionsIndex(-1);
		},
	});

	function handleOnChange(e) {
		setIsFocused(true);
		setSearchQuery(e.target.value);
		setSuggestionsIndex(-1);

		let fuseRes = fuse.search(e.target.value);
		fuseRes = fuseRes.slice(0, 5);
		fuseRes = fuseRes.map((item, i) => {
			return item.item;
		});

		setFilteredSuggestions(fuseRes);

		// Check if an error is still valid:
		if (isError) checkError();
	}

	function handleSuggestionSelected(e, item) {
		e.preventDefault();

		// Set searching for loading animation:
		setIsSearching(true);
		setSearchQuery(item);
		setIsFocused(false);

		// Send to city domain:
		router.push(`/city/${item.toLowerCase()}`).then(() => {
			setIsSearching(false);
		});
	}

	function handleSearchSubmit() {
		// Check search bar has text inside
		if (searchQuery.replace(/\s/g, "") !== "") {
			let fuseRes = fuse.search(searchQuery);

			if (!fuseRes || !fuseRes.length) {
				setIsError(true);
				return;
			}
			setIsError(false);

			setSearchQuery(fuseRes[0].item);
			setIsSearching(true);
			setIsFocused(false);

			// Change query to lower case:
			// Send user to route of new city:
			router.push(`/city/${fuseRes[0].item.toLowerCase()}`).then(() => {
				setIsSearching(false);
			});
		}
	}

	function handleKeyDown(e) {
		if (e.key === "Enter") handleEnterKey(e);

		// Return if no suggestions are visible
		if (!filteredSuggestions) return;

		if (e.key === "ArrowUp") {
			// Prevent cursor movement
			e.preventDefault();
			setSuggestionsIndex((prev) => {
				if (prev <= -1) return -1;
				// Return new index
				return prev - 1;
			});
		}
		if (e.key === "ArrowDown") {
			// Prevent cursor movement
			e.preventDefault();
			setSuggestionsIndex((prev) => {
				if (prev >= filteredSuggestions.length - 1)
					return filteredSuggestions.length - 1;
				// Return new index
				return prev + 1;
			});
		}
	}

	function handleEnterKey(e) {
		e.preventDefault(e);

		// If no suggestion selected:
		if (suggestionsIndex < 0) {
			submitRef.current.click();
			return;
		}

		const suggestionQuery = filteredSuggestions[suggestionsIndex];
		// Set searching for loading animation:
		setIsSearching(true);
		setSearchQuery(suggestionQuery);
		setIsFocused(false);

		// Send to city domain:
		router.push(`/city/${suggestionQuery.toLowerCase()}`).then(() => {
			setIsSearching(false);
		});
	}

	function checkError() {
		const removeError = () => {
			setIsError(false);
		};

		// If empty:
		if (!searchQuery) return removeError();
		if (searchQuery === "") return removeError();
	}

	return (
		<Box position="relative" {...focusWithinProps}>
			{isError && <Text color="red">Invalid City Name</Text>}

			<InputGroup
				as="form"
				onSubmit={(e) => {
					e.preventDefault();
					handleSearchSubmit();
				}}
			>
				<Input
					placeholder={searchQuery ? searchQuery : "Find A City..."}
					value={searchQuery}
					onChange={handleOnChange}
					variant="outline"
					boxShadow="md"
					size="lg"
					onKeyDown={handleKeyDown}
					isInvalid={isError}
					focusBorderColor={isError ? "red.500" : "green.500"}
				/>
				<InputRightElement h="100%" pr={3}>
					{isSearching ? (
						<Spinner></Spinner>
					) : (
						<IconButton
							ref={submitRef}
							variant="ghost"
							icon={<SearchIcon />}
							type="submit"
						></IconButton>
					)}
				</InputRightElement>
			</InputGroup>
			<Flex
				mt={1.5}
				direction="column"
				position="absolute"
				background="white"
				width="100%"
				bottom="min"
				zIndex="999"
				gap={1}
			>
				{isFocused &&
					filteredSuggestions.map((item, i) => {
						const shadow = suggestionsIndex === i ? "outline" : "";
						return (
							<Box
								onTouchEnd={(e) => {
									handleSuggestionSelected(e, item);
								}}
								onClick={(e) => {
									handleSuggestionSelected(e, item);
								}}
								as="button"
								key={i}
								borderWidth={2}
								borderRadius={"md"}
								py={2}
								pl={4}
								boxShadow={shadow}
								_hover={{ boxShadow: "outline" }}
								_focusVisible={{ boxShadow: "outline" }}
							>
								<Text textAlign="left" fontSize="lg" noOfLines={1}>
									{item}
								</Text>
							</Box>
						);
					})}
			</Flex>
		</Box>
	);
}
